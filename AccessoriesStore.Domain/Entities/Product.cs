using System;
using System.Collections.Generic;
using System.Text;

namespace AccessoriesStore.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Material { get; set; }
        public string? Dimensions { get; set; }
        public decimal Price { get; set; }
        public decimal? SalePrice { get; set; }
        public bool IsOnSale { get; set; } = false;
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    }
}
