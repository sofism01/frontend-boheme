export type Rol = 'COMPRADOR' | 'VENDEDOR';
export type Talla = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export const TALLAS: Talla[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export interface Usuario { id: string; nombre: string; correo: string; rol: Rol; activo: boolean }
export interface Sesion { token: string; tokenType: string; expiresIn: number; expiresAt: string; rol: Rol; usuario: Usuario }
export interface Registro { nombre: string; correo: string; password: string; rol: Rol }
export interface LoginRequest { correo: string; password: string }
export interface Dinero { monto: number; moneda: string }
export interface Variante { varianteId: string; sku: string; tipoTalla: Talla; stockDisponible: number }
export interface Prenda { prendaId: string; creadorId: string; nombre: string; descripcion: string; precioBase: Dinero; variantes: Variante[]; stockTotal: number; disponibleParaLaVenta: boolean }
export interface PaginaPrendas { content: Prenda[]; totalElements: number; totalPages: number; page: number; size: number }
export interface Publicacion { creadorId: string; nombre: string; descripcion: string; precioBase: number; moneda: string; stockTotal: number; variantes: { sku: string; tipoTalla: Talla; stockDisponible: number }[] }
export interface LineaBolsa { varianteId: string; cantidad: number; precioUnitario: Dinero; subtotal: Dinero }
export interface Bolsa { bolsaId: string; clienteId: string; lineas: LineaBolsa[]; cerrada: boolean }
export interface LineaPedido extends LineaBolsa { prendaId: string; nombrePrenda: string; sku: string; tipoTalla: Talla }
export interface Pedido { pedidoId: string; bolsaId: string; clienteId: string; estado: string; fechaCreacion: string; lineas: LineaPedido[]; total: Dinero; moneda: string }
export interface ApiError { timestamp: string; status: number; code: string; message: string; path: string; details: Record<string, string> }
