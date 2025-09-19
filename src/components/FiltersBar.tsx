import React from 'react';

interface Props {
  search: string;
  category: string;
  estado: string;
  fuente: string;
  categories: string[];
  estados: string[];
  fuentes: string[];
  onSearchChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
  onFuenteChange: (v: string) => void;
}

/**
 * Barra de filtros reutilizable que permite buscar por texto y seleccionar
 * categoría, estado y fuente. Levanta los cambios al componente padre.
 */
const FiltersBar: React.FC<Props> = ({
  search,
  category,
  estado,
  fuente,
  categories,
  estados,
  fuentes,
  onSearchChange,
  onCategoryChange,
  onEstadoChange,
  onFuenteChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 md:items-end">
      <div className="flex-1">
        <label htmlFor="search" className="sr-only">
          Buscar
        </label>
        <input
          id="search"
          type="text"
          value={search}
          placeholder="Buscar por título o categoría..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-darkBorder bg-darkCard px-3 py-2 text-sm placeholder-gray-500 focus:border-primary focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="category" className="sr-only">
          Categoría
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-md border border-darkBorder bg-darkCard px-3 py-2 text-sm focus:border-primary focus:ring-primary"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="estado" className="sr-only">
          Estado
        </label>
        <select
          id="estado"
          value={estado}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="w-full rounded-md border border-darkBorder bg-darkCard px-3 py-2 text-sm focus:border-primary focus:ring-primary"
        >
          <option value="">Todos los estados</option>
          {estados.map((es) => (
            <option key={es} value={es}>
              {es}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="fuente" className="sr-only">
          Fuente
        </label>
       <select
  value={fuente}
  onChange={(e) => onFuenteChange(e.target.value)}
  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm 
           focus:border-brand-700 focus:ring-brand-700"

>
  <option value="">Todas las fuentes</option>
  {fuentes.map((fu) => (
    <option key={fu} value={fu}>{fu}</option>
  ))}
</select>
      </div>
    </div>
  );
};

export default FiltersBar;