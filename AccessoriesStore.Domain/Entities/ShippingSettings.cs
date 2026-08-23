namespace AccessoriesStore.Domain.Entities;

public class ShippingSettings
{
    public int Id { get; set; }
    public decimal ShippingFee { get; set; } = 0;
    public decimal FreeShippingThreshold { get; set; } = 0; // 0 = no free-shipping threshold
}