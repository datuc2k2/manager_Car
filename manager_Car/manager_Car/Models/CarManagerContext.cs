﻿using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace manager_Car.Models;

public partial class CarManagerContext : DbContext
{
    public CarManagerContext()
    {
    }

    public CarManagerContext(DbContextOptions<CarManagerContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Transaction> Transactions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var ConnectionString = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build().GetConnectionString("DefaultConnection");
        optionsBuilder.UseSqlServer(ConnectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__transact__3213E83FAA1FA01B");

            entity.ToTable("transaction");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Calendar1)
                .HasMaxLength(500)
                .HasColumnName("calendar1");
            entity.Property(e => e.Calendar2)
                .HasMaxLength(500)
                .HasColumnName("calendar2");
            entity.Property(e => e.DateTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("date_time");
            entity.Property(e => e.Point)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("point");
            entity.Property(e => e.ProposeUsername)
                .HasMaxLength(100)
                .HasColumnName("propose_username");
            entity.Property(e => e.ReceiveUsername)
                .HasMaxLength(100)
                .HasColumnName("receive_username");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__user__3213E83F11DFD98E");

            entity.ToTable("user");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Point)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("point");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
