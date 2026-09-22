// src/components/DataCustomer/DataCustomer.jsx
export default function DataCustomer({ customers }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200/80 dark:border-slate-700">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Data Customer</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {customers.map(c => (
          <div key={c} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-600">
            <span className="text-lg font-medium text-slate-700 dark:text-slate-300">{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}