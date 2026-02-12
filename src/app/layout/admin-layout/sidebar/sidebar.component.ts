// src/app/layout/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Menu } from '../../../core/models/menu.model';
import { AuthService, User } from '../../../core/services/auth.service';
import { Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  menus: Menu[] = [];
 @Input() open: boolean = true;

   
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.buildMenu();
    });
  }

  private buildMenu(): void {
    const rol = this.currentUser?.rol || '';

    // 🔹 Menú base (visible para todos)
    const baseMenu: Menu[] = [
      {
        icon: 'home',
        title: 'Dashboard',
        grupo: 'dashboard',
        children: [{ title: 'Inicio', link: '/admin/dashboard' }  ,

          { title: 'Estadisticas', link: '/admin/Estadisticas' }
        ]
        
      }
    ];

    // 🔹 Menú completo (para SuperAdmin)
    const fullMenu: Menu[] = [
      {
        icon: 'gestion',
        title: 'PRODUCTOS',
        grupo: 'mantenimiento',
        children: [
          { title: 'Productos', link: '/admin/mantenimiento/producto' },

        ]
      },
      {
  icon: 'categoria',          // o el nombre de tu ícono (según tu librería)
  title: 'CATEGORÍAS',
  grupo: 'mantenimientoO',
  children: [
    { title: 'Categorías', link: '/admin/mantenimiento/categoria' },        // listar

  ]
},
{
  icon: 'pedidos',          // o el nombre real de tu ícono (carrito)
  title: 'PEDIDOS',
  grupo: 'ventas',          // o el grupo que uses (ej. 'operaciones')
  children: [
    { title: 'Lista de pedidos', link: '/admin/ventas/pedidos' },
   // { title: 'Nuevo pedido', link: '/admin/ventas/pedidos/nuevo' }, // opcional
    //{ title: 'Estados', link: '/admin/ventas/pedidos/estados' }     // opcional
  ]
},

     
      {
  icon: 'clientes',
  title: 'usuarios',
  grupo: 'ventasSq',
  children: [
    {title: 'Lista de usuarios', link: '/admin/usuarios'   },
  
  ]
},

   
 
   
 
    ];
    

    // 🔹 Menú limitado (para otros roles)
    const limitedMenu: Menu[] = [
      {
        icon: 'fas fa-boxes',
        title: 'Productos',
        grupo: 'mantenimiento',
        children: [
          { title: 'Productos', link: '/admin/mantenimiento/producto' }
        ]
      },
      {
        icon: 'fas fa-shopping-cart',
        title: 'Ventas',
        grupo: 'ventas',
        children: [
          { title: 'Órdenes', link: '/admin/ventas' }
        ]
      }
    ];

    // 🔹 Asignar menú según rol
    this.menus =
      rol === 'ADMIN'
        ? [...baseMenu, ...fullMenu] // acceso total
        : [...baseMenu, ...limitedMenu]; // menú básico
  }
}
