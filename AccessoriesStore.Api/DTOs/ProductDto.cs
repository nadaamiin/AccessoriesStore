namespace AccessoriesStore.Api.DTOs;

public class ProductImageDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
}

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Material { get; set; }
    public string? Dimensions { get; set; }
    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
    public bool IsOnSale { get; set; }
    public int StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public List<ProductImageDto> Images { get; set; } = new();
    public bool IsActive { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Material { get; set; }
    public string? Dimensions { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public int CategoryId { get; set; }
}

public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Material { get; set; }
    public string? Dimensions { get; set; }
    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
    public bool IsOnSale { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
    public int CategoryId { get; set; }
}