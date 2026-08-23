using ClimaGuard.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ClimaGuard.API.Data
{
    public class ClimaGuardDbContext : DbContext
    {
        public ClimaGuardDbContext(DbContextOptions<ClimaGuardDbContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Sensor> Sensores => Set<Sensor>();
        public DbSet<Lectura> Lecturas => Set<Lectura>();
        public DbSet<Alerta> Alertas => Set<Alerta>();
        public DbSet<Evento> Eventos => Set<Evento>();
        public DbSet<Bitacora> Bitacoras => Set<Bitacora>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<Sensor>()
                .HasMany(s => s.Lecturas)
                .WithOne(l => l.Sensor)
                .HasForeignKey(l => l.IdSensor);

            modelBuilder.Entity<Alerta>()
                .HasOne(a => a.Sensor)
                .WithMany()
                .HasForeignKey(a => a.IdSensor)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Alerta>()
                .HasOne(a => a.Lectura)
                .WithMany()
                .HasForeignKey(a => a.IdLectura)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Evento>()
                .HasOne(e => e.Alerta)
                .WithMany()
                .HasForeignKey(e => e.IdAlerta)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Evento>()
                .HasOne(e => e.Sensor)
                .WithMany()
                .HasForeignKey(e => e.IdSensor)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bitacora>()
                .HasOne(b => b.Usuario)
                .WithMany()
                .HasForeignKey(b => b.IdUsuario)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}