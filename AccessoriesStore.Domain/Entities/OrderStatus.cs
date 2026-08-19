using System;
using System.Collections.Generic;
using System.Text;

namespace AccessoriesStore.Domain.Entities
{
    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled
    }
}
