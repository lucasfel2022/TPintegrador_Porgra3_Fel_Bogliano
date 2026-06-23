const PRODUCTOS_MOCK = [
  // ── JUEGOS ──────────────────────────────────────────────────────────────
  { id: 1, nombre: "FIFA 26", descripcion: "Edición estándar para PS5 y Xbox Series X", precio: 54999, imagen: "https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=400&h=400&fit=crop", categoria: "juegos", activo: true },
  { id: 2, nombre: "The Legend of Zelda: Tears of the Kingdom", descripcion: "Edición física para Nintendo Switch", precio: 64999, imagen: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop", categoria: "juegos", activo: true },
  { id: 3, nombre: "God of War Ragnarök", descripcion: "Edición estándar PS5", precio: 49999, imagen: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop", categoria: "juegos", activo: true },
  { id: 4, nombre: "Elden Ring", descripcion: "Juego base + DLC Shadow of the Erdtree", precio: 59999, imagen: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&h=400&fit=crop", categoria: "juegos", activo: true },
  { id: 5, nombre: "Mario Kart 8 Deluxe", descripcion: "Para Nintendo Switch, incluye pase de circuitos", precio: 47999, imagen: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=400&fit=crop", categoria: "juegos", activo: true },
  { id: 6, nombre: "Call of Duty: Black Ops 6", descripcion: "Edición estándar multiplataforma", precio: 57999, imagen: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=400&fit=crop", categoria: "juegos", activo: true },
  { id: 7, nombre: "Spider-Man 2", descripcion: "Edición exclusiva PS5", precio: 52999, imagen: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=400&fit=crop", categoria: "juegos", activo: false },
  { id: 8, nombre: "Hollow Knight: Silksong", descripcion: "Edición física multiplataforma", precio: 38999, imagen: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop", categoria: "juegos", activo: true },

  // ── ACCESORIOS ──────────────────────────────────────────────────────────
  { id: 9, nombre: "Control DualSense", descripcion: "Joystick inalámbrico PS5, varios colores", precio: 64999, imagen: "https://images.unsplash.com/photo-1592840496694-26d035b52a15?w=400&h=400&fit=crop", categoria: "accesorios", activo: true },
  { id: 10, nombre: "Auriculares Gamer HyperX Cloud", descripcion: "Sonido envolvente 7.1, micrófono desmontable", precio: 45999, imagen: "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop", categoria: "accesorios", activo: true },
  { id: 11, nombre: "Teclado Mecánico RGB", descripcion: "Switches azules, retroiluminado", precio: 38999, imagen: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop", categoria: "accesorios", activo: true },
  { id: 12, nombre: "Mouse Gamer Logitech G502", descripcion: "Sensor óptico de alta precisión, 11 botones", precio: 29999, imagen: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop", categoria: "accesorios", activo: true },
  { id: 13, nombre: "Silla Gamer ergonómica", descripcion: "Reclinable, soporte lumbar incluido", precio: 189999, imagen: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop", categoria: "accesorios", activo: true },
  { id: 14, nombre: "Volante Logitech G29", descripcion: "Force feedback, compatible PS5/PC", precio: 159999, imagen: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop", categoria: "accesorios", activo: true },
  { id: 15, nombre: "Mochila Gamer", descripcion: "Compartimento acolchado para notebook", precio: 24999, imagen: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", categoria: "accesorios", activo: false },
  { id: 16, nombre: "Mousepad XXL RGB", descripcion: "90x40cm, iluminación LED", precio: 18999, imagen: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=400&fit=crop", categoria: "accesorios", activo: true },
];
