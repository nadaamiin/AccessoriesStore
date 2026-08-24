using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccessoriesStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddContactMessageStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "ContactMessages",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "ContactMessages");
        }
    }
}
