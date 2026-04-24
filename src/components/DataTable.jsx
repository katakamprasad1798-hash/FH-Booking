import { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  Search, X, Download, Filter, FilterX 
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DataTable({ columns, data, initialPageSize = 10, title = "Data" }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState({});
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Filtering logic
  const filteredData = useMemo(() => {
    let result = data;

    // Global search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row => {
        return columns.some(col => {
          let value = '';
          if (col.accessor) {
            value = String(row[col.accessor] || '');
          } else if (col.cell) {
            value = JSON.stringify(Object.values(row)).toLowerCase();
            return value.includes(query);
          }
          return value.toLowerCase().includes(query);
        });
      });
    }

    // Column-specific filters
    Object.keys(columnFilters).forEach(accessor => {
      const filterValue = columnFilters[accessor].toLowerCase();
      if (filterValue) {
        result = result.filter(row => {
          const value = String(row[accessor] || '').toLowerCase();
          return value.includes(filterValue);
        });
      }
    });

    // Date range filter (assumes 'function_date' or 'date' or 'created_at')
    if (dateRange.start || dateRange.end) {
      result = result.filter(row => {
        const rowDate = row.function_date || row.date || row.created_at || row.booking_date;
        if (!rowDate) return true;
        const d = new Date(rowDate).getTime();
        const start = dateRange.start ? new Date(dateRange.start).getTime() : -Infinity;
        const end = dateRange.end ? new Date(dateRange.end).getTime() : Infinity;
        return d >= start && d <= end;
      });
    }

    return result;
  }, [data, searchQuery, columnFilters, columns, dateRange]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handleFirst = () => setCurrentPage(1);
  const handleLast = () => setCurrentPage(totalPages);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleColumnFilterChange = (accessor, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [accessor]: value
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setColumnFilters({});
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    if (filteredData.length === 0) return;

    // Prepare data for XLSX
    const exportData = filteredData.map(row => {
      const formattedRow = {};
      columns.forEach(col => {
        if (col.header !== 'Action') {
          let val = '';
          if (col.accessor) {
            val = row[col.accessor];
          } else if (col.cell) {
            // For complex cells, we try to get a string representation
            // We'll pass the row to the cell function and if it returns a string/number, use it
            // but cell usually returns JSX. So we prefer accessors for exports.
            val = row[col.accessor] || '';
          }
          formattedRow[col.header] = val;
        }
      });
      return formattedRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    // Generate filename
    const filename = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="surface" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Table Header / Toolbar */}
      <div style={{ 
        padding: '1rem 1.5rem', 
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button 
              className={`btn-icon ${showColumnFilters ? 'active' : ''}`} 
              onClick={() => setShowColumnFilters(!showColumnFilters)}
              title="Toggle Column Filters"
              style={{ backgroundColor: showColumnFilters ? '#e5e7eb' : 'transparent' }}
            >
              <Filter size={18} />
            </button>
            <button 
              className="btn-icon" 
              onClick={clearAllFilters}
              title="Clear All Filters"
            >
              <FilterX size={18} />
            </button>
            <button 
              className="btn-icon" 
              onClick={exportToExcel}
              title="Export to Excel"
              disabled={filteredData.length === 0}
            >
              <Download size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>Date:</span>
            <input 
              type="date" 
              className="form-control" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span style={{ fontSize: '0.75rem' }}>-</span>
            <input 
              type="date" 
              className="form-control" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '250px' }}>
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} 
          />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="form-control"
            style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', height: '36px' }}
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              style={{ 
                position: 'absolute', 
                right: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                padding: '2px'
              }}
              className="btn-icon"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="table-wrapper" style={{ flexGrow: 1, overflow: 'auto' }}>
        <table>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={{ minWidth: col.width || 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span>{col.header}</span>
                    {showColumnFilters && col.accessor && (
                      <input 
                        type="text" 
                        placeholder={`Filter...`}
                        value={columnFilters[col.accessor] || ''}
                        onChange={(e) => handleColumnFilterChange(col.accessor, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.25rem 0.5rem', 
                          fontWeight: 'normal',
                          borderRadius: '0.25rem',
                          border: '1px solid var(--border-color)',
                          width: '100%'
                        }}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No results found
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div style={{ 
        padding: '1rem', 
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--bg-surface)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Rows per page:</span>
            <select 
              value={pageSize} 
              onChange={handlePageSizeChange}
              style={{ 
                padding: '0.25rem', 
                borderRadius: '0.25rem', 
                border: '1px solid var(--border-color)',
                fontSize: '0.875rem'
              }}
            >
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <button className="btn-icon" onClick={handleFirst} disabled={currentPage === 1 || totalPages === 0}><ChevronsLeft size={18} /></button>
          <button className="btn-icon" onClick={handlePrev} disabled={currentPage === 1 || totalPages === 0}><ChevronLeft size={18} /></button>
          <span style={{ fontSize: '0.875rem', margin: '0 0.75rem', fontWeight: '500' }}>Page {currentPage} of {totalPages || 1}</span>
          <button className="btn-icon" onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight size={18} /></button>
          <button className="btn-icon" onClick={handleLast} disabled={currentPage === totalPages || totalPages === 0}><ChevronsRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}
