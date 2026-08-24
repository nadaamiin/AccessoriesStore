using AccessoriesStore.Domain.Entities;

namespace AccessoriesStore.Tests.Integration.Fixtures;

/// <summary>
/// Builder for creating test domain entities with sensible defaults.
/// Makes it easy to create test data with minimal boilerplate.
/// </summary>
public class TestDataBuilder
{
    public static ProductBuilder CreateProduct()
    {
        return new ProductBuilder();
    }

    public static PromoCodeBuilder CreatePromoCode()
    {
        return new PromoCodeBuilder();
    }

    public static OrderBuilder CreateOrder()
    {
        return new OrderBuilder();
    }

    public static CategoryBuilder CreateCategory()
    {
        return new CategoryBuilder();
    }
}

public class ProductBuilder
{
    private int _id = 1;
    private string _name = "Test Product";
    private string _description = "Test Description";
    private decimal _price = 100m;
    private decimal _salePrice = 80m;
    private bool _isOnSale = false;
    private int _stockQuantity = 10;
    private bool _isActive = true;
    private int _categoryId = 1;
    private Category? _category;

    public ProductBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public ProductBuilder WithPrice(decimal price)
    {
        _price = price;
        return this;
    }

    public ProductBuilder WithStockQuantity(int quantity)
    {
        _stockQuantity = quantity;
        return this;
        }

    public ProductBuilder WithIsActive(bool isActive)
    {
        _isActive = isActive;
        return this;
    }

    public ProductBuilder WithCategory(Category category)
    {
        _category = category;
        return this;
    }

    public Product Build()
    {
        return new Product
        {
            Id = _id,
            Name = _name,
            Description = _description,
            Price = _price,
            SalePrice = _salePrice,
            IsOnSale = _isOnSale,
            StockQuantity = _stockQuantity,
            IsActive = _isActive,
            CategoryId = _categoryId,
            Category = _category
        };
    }
}

public class PromoCodeBuilder
{
    private int _id = 1;
    private string _code = "TESTCODE";
    private string _ownerName = "Test Owner";
    private bool _isPercentage = true;
    private decimal _discountValue = 10m;
    private bool _isActive = true;
    private DateTime? _expiresAt = null;

    public PromoCodeBuilder WithCode(string code)
    {
        _code = code;
        return this;
    }

    public PromoCodeBuilder WithDiscountValue(decimal value)
    {
        _discountValue = value;
        return this;
    }

    public PromoCodeBuilder WithIsPercentage(bool isPercentage)
    {
        _isPercentage = isPercentage;
        return this;
    }

    public PromoCodeBuilder WithIsActive(bool isActive)
    {
        _isActive = isActive;
        return this;
    }

    public PromoCodeBuilder WithExpiresAt(DateTime? expiresAt)
    {
        _expiresAt = expiresAt;
        return this;
    }

    public PromoCode Build()
    {
        return new PromoCode
        {
            Id = _id,
            Code = _code,
            OwnerName = _ownerName,
            IsPercentage = _isPercentage,
            DiscountValue = _discountValue,
            IsActive = _isActive,
            ExpiresAt = _expiresAt
        };
    }
}

public class OrderBuilder
{
    private int _id = 1;
    private string _orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-TEST01";
    private string _customerName = "Test Customer";
    private string _customerEmail = "test@example.com";
    private string _customerPhone = "+20101234567";
    private string _shippingAddress = "123 Test St";
    private OrderStatus _status = OrderStatus.Pending;
    private decimal _totalAmount = 100m;
    private decimal _shippingFee = 20m;
    private decimal _discountAmount = 0m;
    private string? _promoCode = null;
    private DateTime _createdAt = DateTime.UtcNow;

    public OrderBuilder WithOrderNumber(string orderNumber)
    {
        _orderNumber = orderNumber;
        return this;
    }

    public OrderBuilder WithCustomerEmail(string email)
    {
        _customerEmail = email;
        return this;
    }

    public OrderBuilder WithStatus(OrderStatus status)
    {
        _status = status;
        return this;
    }

    public OrderBuilder WithTotalAmount(decimal amount)
    {
        _totalAmount = amount;
        return this;
    }

    public OrderBuilder WithPromoCode(string code)
    {
        _promoCode = code;
        return this;
    }

    public Order Build()
    {
        return new Order
        {
            Id = _id,
            OrderNumber = _orderNumber,
            CustomerName = _customerName,
            CustomerEmail = _customerEmail,
            CustomerPhone = _customerPhone,
            ShippingAddress = _shippingAddress,
            Status = _status,
            TotalAmount = _totalAmount,
            ShippingFee = _shippingFee,
            DiscountAmount = _discountAmount,
            PromoCode = _promoCode,
            CreatedAt = _createdAt
        };
    }
}

public class CategoryBuilder
{
    private int _id = 1;
    private string _name = "Test Category";

    public CategoryBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public Category Build()
    {
        return new Category
        {
            Id = _id,
            Name = _name
        };
    }
}
