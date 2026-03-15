// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Using OpenZeppelin 4.9.0 to avoid memory-safe-assembly warnings
import "@openzeppelin/contracts@4.9.0/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts@4.9.0/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts@4.9.0/security/ReentrancyGuard.sol";

/// @title OctoHive
/// @notice Standalone P2P token order matching contract for decentralized token swapping
/// @dev Features: order management, whitelist-based trading, admin controls, expiry handling
contract OctoHive is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ========== STRUCTS ==========
    struct Order {
        address maker;
        address tokenIn;
        address tokenOut;
        uint128 amountIn;
        uint128 minAmountOut;
        uint256 expiry;
        bool active;
    }

    // ========== EVENTS ==========
    event OrderPosted(
        uint256 indexed orderId,
        address indexed maker,
        address indexed tokenIn,
        address tokenOut,
        uint128 amountIn,
        uint128 minAmountOut,
        uint256 expiry
    );
    event OrderCancelled(uint256 indexed orderId, address indexed maker);
    event OrderExpired(uint256 indexed orderId, address indexed maker);
    event P2PTrade(
        uint256 indexed orderId,
        address indexed maker,
        address indexed taker,
        address tokenIn,
        address tokenOut,
        uint128 amountInMaker,
        uint128 amountOutMaker
    );
    event BotAdded(address indexed bot);
    event BotRemoved(address indexed bot);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);
    event PendingAdminSet(address indexed pendingAdmin);
    event RefundFailed(uint256 indexed orderId, address indexed maker, address token);

    // ========== ERRORS ==========
    error NotAdmin();
    error NotWhitelisted();
    error OrderNotFound();
    error OrderNotActive();
    error Unauthorized();
    error InvalidAmounts();
    error InvalidDuration();
    error ZeroAddress();
    error DurationTooLong();
    error NotPendingAdmin();
    error InsufficientOutput();

    // ========== CONSTANTS ==========
    uint256 public constant MAX_ORDER_DURATION = 30 days;
    uint256 public constant MAX_ITERATIONS = 100;

    // ========== STATE ==========
    address public admin;
    address public pendingAdmin;
    mapping(address => bool) public allowedBots;
    uint256 public nextOrderId;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public userOrders; // user -> orderIds
    mapping(address => mapping(address => uint256)) public unclaimedBalances; // user -> token -> amount

    // ========== CONSTRUCTOR ==========
    constructor(address _admin) {
        if (_admin == address(0)) revert ZeroAddress();
        admin = _admin;
    }

    // ========== MODIFIERS ==========
    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier onlyWhitelisted() {
        if (!allowedBots[msg.sender]) revert NotWhitelisted();
        _;
    }

    // ========== ADMIN FUNCTIONS ==========
    /// @notice Add a bot to the whitelist
    function addBot(address bot) external onlyAdmin {
        if (bot == address(0)) revert ZeroAddress();
        allowedBots[bot] = true;
        emit BotAdded(bot);
    }

    /// @notice Remove a bot from the whitelist
    function removeBot(address bot) external onlyAdmin {
        allowedBots[bot] = false;
        emit BotRemoved(bot);
    }

    /// @notice Initiate two-step admin transfer
    function setAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert ZeroAddress();
        pendingAdmin = newAdmin;
        emit PendingAdminSet(newAdmin);
    }

    /// @notice Accept admin role (must be called by pendingAdmin)
    function acceptAdmin() external {
        if (msg.sender != pendingAdmin) revert NotPendingAdmin();
        address oldAdmin = admin;
        admin = msg.sender;
        pendingAdmin = address(0);
        emit AdminChanged(oldAdmin, msg.sender);
    }

    // ========== ORDER FUNCTIONS ==========
    /// @notice Post a new order to the order book
    /// @param tokenIn Token to sell
    /// @param tokenOut Token to buy
    /// @param amountIn Amount of tokenIn to sell
    /// @param minAmountOut Minimum amount of tokenOut to receive
    /// @param duration Duration in seconds (max 30 days)
    /// @return orderId The ID of the posted order
    function postOrder(
        address tokenIn,
        address tokenOut,
        uint128 amountIn,
        uint128 minAmountOut,
        uint256 duration
    )
        external
        onlyWhitelisted
        nonReentrant
        returns (uint256 orderId)
    {
        if (tokenIn == address(0) || tokenOut == address(0)) revert ZeroAddress();
        if (amountIn == 0 || minAmountOut == 0) revert InvalidAmounts();
        if (duration == 0 || duration > MAX_ORDER_DURATION) revert InvalidDuration();

        orderId = nextOrderId++;
        uint256 expiry = block.timestamp + duration;

        orders[orderId] = Order({
            maker: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            minAmountOut: minAmountOut,
            expiry: expiry,
            active: true
        });

        userOrders[msg.sender].push(orderId);

        // Transfer tokenIn from maker to contract
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        emit OrderPosted(
            orderId,
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            expiry
        );
    }

    /// @notice Cancel an active order and refund tokens
    /// @param orderId The order ID to cancel
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];

        if (orderId >= nextOrderId) revert OrderNotFound();
        if (order.maker == address(0)) revert OrderNotFound();
        if (msg.sender != order.maker) revert Unauthorized();
        if (!order.active) revert OrderNotActive();

        order.active = false;
        _removeUserOrder(msg.sender, orderId);

        // Refund tokenIn to maker
        IERC20(order.tokenIn).safeTransfer(order.maker, order.amountIn);

        emit OrderCancelled(orderId, order.maker);
    }

    /// @notice Match orders and execute P2P swap
    /// @param makerOrderId The maker's order ID
    /// @param takerTokenIn The taker's input token
    /// @param takerAmountIn The taker's input amount
    /// @return success True if trade was executed
    function matchOrder(
        uint256 makerOrderId,
        address takerTokenIn,
        uint128 takerAmountIn
    )
        external
        onlyWhitelisted
        nonReentrant
        returns (bool success)
    {
        Order storage order = orders[makerOrderId];

        // Validate order
        if (makerOrderId >= nextOrderId) revert OrderNotFound();
        if (!order.active) revert OrderNotActive();
        if (block.timestamp > order.expiry) revert OrderNotActive();

        // Validate trade match
        if (takerTokenIn != order.tokenOut) revert InvalidAmounts();
        if (takerAmountIn < order.minAmountOut) revert InsufficientOutput();

        // Deactivate order
        order.active = false;
        _removeUserOrder(order.maker, makerOrderId);

        // Execute swap: taker pays maker
        IERC20(takerTokenIn).safeTransferFrom(
            msg.sender,
            order.maker,
            takerAmountIn
        );

        // Maker pays taker
        IERC20(order.tokenIn).safeTransfer(msg.sender, order.amountIn);

        emit P2PTrade(
            makerOrderId,
            order.maker,
            msg.sender,
            order.tokenIn,
            order.tokenOut,
            order.amountIn,
            takerAmountIn
        );

        return true;
    }

    // ========== ORDER EXPIRY & CLEANUP ==========
    /// @notice Purge expired orders and refund tokens (permissionless)
    /// @param maxPurge Maximum number of orders to purge in one call
    function purgeExpiredOrders(uint256 maxPurge) external nonReentrant {
        uint256 purged = 0;

        for (uint256 orderId = 0; orderId < nextOrderId && purged < maxPurge; orderId++) {
            Order storage order = orders[orderId];

            if (order.active && block.timestamp > order.expiry) {
                order.active = false;

                // Attempt to refund tokenIn to maker
                address token = order.tokenIn;
                try IERC20(token).transfer(order.maker, order.amountIn) returns (bool success) {
                    if (!success) {
                        unclaimedBalances[order.maker][token] += order.amountIn;
                        emit RefundFailed(orderId, order.maker, token);
                    }
                } catch {
                    unclaimedBalances[order.maker][token] += order.amountIn;
                    emit RefundFailed(orderId, order.maker, token);
                }

                emit OrderExpired(orderId, order.maker);
                purged++;
            }
        }
    }

    /// @notice Claim failed refunds using pull pattern
    /// @param token The token to claim
    function claimRefund(address token) external nonReentrant {
        uint256 amount = unclaimedBalances[msg.sender][token];
        if (amount == 0) revert InvalidAmounts();

        unclaimedBalances[msg.sender][token] = 0;
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    // ========== VIEW FUNCTIONS ==========
    /// @notice Get all active orders for a user
    function getUserOrders(address user) external view returns (uint256[] memory) {
        return userOrders[user];
    }

    /// @notice Get order details
    function getOrder(uint256 orderId)
        external
        view
        returns (
            address maker,
            address tokenIn,
            address tokenOut,
            uint128 amountIn,
            uint128 minAmountOut,
            uint256 expiry,
            bool active
        )
    {
        Order storage order = orders[orderId];
        return (
            order.maker,
            order.tokenIn,
            order.tokenOut,
            order.amountIn,
            order.minAmountOut,
            order.expiry,
            order.active
        );
    }

    /// @notice Check if an order is expired
    function isOrderExpired(uint256 orderId) external view returns (bool) {
        return block.timestamp > orders[orderId].expiry;
    }

    /// @notice Get unclaimed balance for a user
    function getUnclaimedBalance(address user, address token)
        external
        view
        returns (uint256)
    {
        return unclaimedBalances[user][token];
    }

    // ========== INTERNAL FUNCTIONS ==========
    /// @dev Remove an order from user's order list
    function _removeUserOrder(address user, uint256 orderId) internal {
        uint256[] storage ids = userOrders[user];
        for (uint256 i = 0; i < ids.length; i++) {
            if (ids[i] == orderId) {
                ids[i] = ids[ids.length - 1];
                ids.pop();
                return;
            }
        }
    }
}
