import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Plugin for creating tables in jspdf
import { Sun, Moon, LogOut, UserPlus, FilePlus, DollarSign, ArrowLeft, Download, Trash2, Eye } from 'lucide-react'; // Using lucide-react for icons

// --- Mock Data ---
// Helper function to generate unique IDs
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper function to format dates
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN');
  } catch (e) {
    return 'Invalid Date';
  }
};

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const initialCustomers = [
  { id: generateId(), name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543210' },
  { id: generateId(), name: 'Sunita Sharma', email: 'sunita@example.com', phone: '9876543211' },
  { id: generateId(), name: 'Amit Patel', email: 'amit@example.com', phone: '9876543212' },
  { id: generateId(), name: 'Priya Singh', email: 'priya@example.com', phone: '9876543213' },
  { id: generateId(), name: 'Vikram Rao', email: 'vikram@example.com', phone: '9876543214' },
  { id: generateId(), name: 'Anjali Gupta', email: 'anjali@example.com', phone: '9876543215' },
  { id: generateId(), name: 'Sandeep Verma', email: 'sandeep@example.com', phone: '9876543216' },
  { id: generateId(), name: 'Meena Desai', email: 'meena@example.com', phone: '9876543217' },
  { id: generateId(), name: 'Arun Joshi', email: 'arun@example.com', phone: '9876543218' },
  { id: generateId(), name: 'Deepa Reddy', email: 'deepa@example.com', phone: '9876543219' },
];

const initialLoans = [
  // Rajesh Kumar Loans
  { id: generateId(), customerId: initialCustomers[0].id, itemSold: 'Groceries', amount: 1500, date: '2025-04-10', dueDate: '2025-05-10' },
  { id: generateId(), customerId: initialCustomers[0].id, itemSold: 'Milk Subscription', amount: 600, date: '2025-04-25', dueDate: '2025-05-25' },
  // Sunita Sharma Loans
  { id: generateId(), customerId: initialCustomers[1].id, itemSold: 'Tailoring Service', amount: 850, date: '2025-03-15', dueDate: '2025-04-15' }, // Overdue
  // Amit Patel Loans
  { id: generateId(), customerId: initialCustomers[2].id, itemSold: 'Snacks', amount: 300, date: '2025-04-28', dueDate: '2025-05-15' },
  // Priya Singh Loans
  { id: generateId(), customerId: initialCustomers[3].id, itemSold: 'Vegetables', amount: 700, date: '2025-04-05', dueDate: '2025-05-05' },
  { id: generateId(), customerId: initialCustomers[3].id, itemSold: 'Household items', amount: 1200, date: '2025-04-20', dueDate: '2025-05-20' },
   // Vikram Rao Loans
  { id: generateId(), customerId: initialCustomers[4].id, itemSold: 'Electronics Repair', amount: 2500, date: '2025-03-01', dueDate: '2025-04-01' }, // Overdue
  // Anjali Gupta Loans
  { id: generateId(), customerId: initialCustomers[5].id, itemSold: 'Stationery', amount: 450, date: '2025-04-18', dueDate: '2025-05-18' },
  // Sandeep Verma - No loans yet
  // Meena Desai Loans
  { id: generateId(), customerId: initialCustomers[7].id, itemSold: 'Clothing Alteration', amount: 550, date: '2025-04-22', dueDate: '2025-05-22' },
  // Arun Joshi Loans
  { id: generateId(), customerId: initialCustomers[8].id, itemSold: 'Hardware Supplies', amount: 1800, date: '2025-04-12', dueDate: '2025-05-12' },
  // Deepa Reddy Loans
  { id: generateId(), customerId: initialCustomers[9].id, itemSold: 'Bakery Items', amount: 400, date: '2025-04-30', dueDate: '2025-05-30' },
];

const initialRepayments = [
  // Rajesh Kumar Repayments
  { id: generateId(), loanId: initialLoans[0].id, amount: 500, date: '2025-04-20' },
  // Sunita Sharma Repayments - None yet for overdue loan
  // Priya Singh Repayments
  { id: generateId(), loanId: initialLoans[4].id, amount: 700, date: '2025-04-25' }, // Fully paid
  // Vikram Rao Repayments
  { id: generateId(), loanId: initialLoans[6].id, amount: 1000, date: '2025-03-20' },
];

// --- Context API ---

// Authentication Context
const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage for persisted login state
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const login = (email, password) => {
    // Mock login logic - replace with actual API call if needed
    if (email === 'shopkeeper@test.com' && password === 'password') {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
const useAuth = () => useContext(AuthContext);

// Data Context (Customers, Loans, Repayments)
const DataContext = createContext();
const DataProvider = ({ children }) => {
  const [customers, setCustomers] = useState(() => {
      const saved = localStorage.getItem('crediKhaata_customers');
      return saved ? JSON.parse(saved) : initialCustomers;
  });
  const [loans, setLoans] = useState(() => {
      const saved = localStorage.getItem('crediKhaata_loans');
      return saved ? JSON.parse(saved) : initialLoans;
  });
  const [repayments, setRepayments] = useState(() => {
      const saved = localStorage.getItem('crediKhaata_repayments');
      return saved ? JSON.parse(saved) : initialRepayments;
  });

  // Persist data to localStorage whenever it changes
  useEffect(() => {
      localStorage.setItem('crediKhaata_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
      localStorage.setItem('crediKhaata_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
      localStorage.setItem('crediKhaata_repayments', JSON.stringify(repayments));
  }, [repayments]);


  const addCustomer = (customer) => {
    setCustomers((prev) => [...prev, { ...customer, id: generateId() }]);
  };

  const addLoan = (loan) => {
    setLoans((prev) => [...prev, { ...loan, id: generateId() }]);
  };

  const addRepayment = (repayment) => {
    setRepayments((prev) => [...prev, { ...repayment, id: generateId() }]);
  };

  const deleteCustomer = (customerId) => {
      // Also delete associated loans and repayments
      const loansToDelete = loans.filter(l => l.customerId === customerId).map(l => l.id);
      setRepayments(prev => prev.filter(r => !loansToDelete.includes(r.loanId)));
      setLoans(prev => prev.filter(l => l.customerId !== customerId));
      setCustomers(prev => prev.filter(c => c.id !== customerId));
  };

  const deleteLoan = (loanId) => {
      // Also delete associated repayments
      setRepayments(prev => prev.filter(r => r.loanId !== loanId));
      setLoans(prev => prev.filter(l => l.id !== loanId));
  };

  const deleteRepayment = (repaymentId) => {
      setRepayments(prev => prev.filter(r => r.id !== repaymentId));
  };

  // --- Calculated Data ---
  const getLoanRepayments = useCallback((loanId) => {
      return repayments.filter(r => r.loanId === loanId);
  }, [repayments]);

  const getLoanBalance = useCallback((loan) => {
      const totalRepaid = getLoanRepayments(loan.id).reduce((sum, r) => sum + r.amount, 0);
      return loan.amount - totalRepaid;
  }, [getLoanRepayments]);

  const isLoanOverdue = useCallback((loan) => {
      const balance = getLoanBalance(loan);
      return balance > 0 && new Date(loan.dueDate) < new Date();
  }, [getLoanBalance]);

  const getCustomerLoans = useCallback((customerId) => {
      return loans.filter(l => l.customerId === customerId);
  }, [loans]);

  const getCustomerData = useCallback((customerId) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return null;

      const customerLoans = getCustomerLoans(customerId);
      let outstandingBalance = 0;
      let nextDueDate = null;
      let isOverdue = false;
      const today = new Date();

      customerLoans.forEach(loan => {
          const balance = getLoanBalance(loan);
          if (balance > 0) {
              outstandingBalance += balance;
              const dueDate = new Date(loan.dueDate);
              if (dueDate < today) {
                  isOverdue = true; // Mark as overdue if any loan is past due
              }
              if (!nextDueDate || dueDate < new Date(nextDueDate)) {
                  nextDueDate = loan.dueDate;
              }
          }
      });

      return {
          ...customer,
          outstandingBalance,
          nextDueDate,
          status: isOverdue ? 'Overdue' : (outstandingBalance > 0 ? 'Due' : 'Paid'),
          isOverdue
      };
  }, [customers, getCustomerLoans, getLoanBalance]);


  const customersWithDetails = useMemo(() => {
      return customers.map(c => getCustomerData(c.id)).filter(Boolean);
  }, [customers, getCustomerData]);


  return (
    <DataContext.Provider value={{
        customers,
        loans,
        repayments,
        addCustomer,
        addLoan,
        addRepayment,
        deleteCustomer,
        deleteLoan,
        deleteRepayment,
        getCustomerLoans,
        getLoanRepayments,
        getLoanBalance,
        isLoanOverdue,
        getCustomerData,
        customersWithDetails
     }}>
      {children}
    </DataContext.Provider>
  );
};
const useData = () => useContext(DataContext);

// --- UI Components ---

// Toast Notification
const ToastContext = createContext();
const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3000); // Hide after 3 seconds
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} dark:bg-opacity-80 z-50`}>
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
};
const useToast = () => useContext(ToastContext);


// Theme Toggle Button
const ThemeToggleButton = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

// Navbar
const Navbar = ({ currentPage, navigate }) => {
  const { logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
      <h1 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">CrediKhaata</h1>
      <div className="flex items-center space-x-2 md:space-x-4">
        <ThemeToggleButton />
        <button
          onClick={logout}
          className="p-2 rounded-full bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

// --- Pages ---

// Login Page
const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('shopkeeper@test.com'); // Pre-fill for convenience
  const [password, setPassword] = useState('password'); // Pre-fill for convenience
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!login(email, password)) {
      setError('Invalid email or password.');
      showToast('Login failed!', 'error');
    } else {
        showToast('Login successful!', 'success');
        // AuthProvider handles navigation via isAuthenticated state change in App
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-8">CrediKhaata Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Login
            </button>
          </div>
           <p className="text-xs text-center text-gray-500 dark:text-gray-400">Use email: shopkeeper@test.com, password: password</p>
        </form>
      </div>
    </div>
  );
};

// Dashboard Page
const DashboardPage = ({ navigate }) => {
  const { customersWithDetails, deleteCustomer } = useData();
  const { showToast } = useToast();

  const handleDelete = (customerId, customerName) => {
      if(window.confirm(`Are you sure you want to delete ${customerName} and all their associated data? This cannot be undone.`)) {
          deleteCustomer(customerId);
          showToast(`${customerName} deleted successfully.`, 'success');
      }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Customer Dashboard</h2>
        <button
          onClick={() => navigate('addCustomer')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow"
        >
          <UserPlus size={18} className="mr-2" /> Add Customer
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-auto text-left">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase">Name</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase text-right">Balance</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase hidden md:table-cell">Next Due Date</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase">Status</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {customersWithDetails.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500 dark:text-gray-400">No customers found. Add one!</td>
                </tr>
              )}
              {customersWithDetails.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => navigate('customerDetail', { customerId: customer.id })}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {customer.name}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">{formatCurrency(customer.outstandingBalance)}</td>
                  <td className="py-3 px-4 hidden md:table-cell">{formatDate(customer.nextDueDate)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      customer.isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100' :
                      customer.outstandingBalance > 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100' :
                      'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => navigate('customerDetail', { customerId: customer.id })}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-600"
                          title="Delete Customer"
                        >
                          <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Customer Detail Page
const CustomerDetailPage = ({ navigate, params }) => {
  const { customerId } = params;
  const { getCustomerData, getCustomerLoans, getLoanRepayments, getLoanBalance, isLoanOverdue, deleteLoan, deleteRepayment } = useData();
  const { showToast } = useToast();

  const customer = getCustomerData(customerId);
  const loans = getCustomerLoans(customerId);

  if (!customer) {
    return <div className="p-6 text-center text-red-500">Customer not found.</div>;
  }

  // Function to generate PDF statement
  const generatePDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Item", "Loan Date", "Due Date", "Amount", "Repaid", "Balance", "Status"];
    const tableRows = [];

    doc.setFontSize(18);
    doc.text(`CrediKhaata Statement - ${customer.name}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Email: ${customer.email || 'N/A'}`, 14, 30);
    doc.text(`Phone: ${customer.phone || 'N/A'}`, 14, 36);
    doc.text(`Total Outstanding: ${formatCurrency(customer.outstandingBalance)}`, 14, 42);

    loans.forEach(loan => {
        const repayments = getLoanRepayments(loan.id);
        const totalRepaid = repayments.reduce((sum, r) => sum + r.amount, 0);
        const balance = getLoanBalance(loan);
        const overdue = isLoanOverdue(loan);

        const loanData = [
            loan.itemSold,
            formatDate(loan.date),
            formatDate(loan.dueDate),
            formatCurrency(loan.amount),
            formatCurrency(totalRepaid),
            formatCurrency(balance),
            overdue ? 'Overdue' : (balance <= 0 ? 'Paid' : 'Due'),
        ];
        tableRows.push(loanData);

        // Add repayment details under each loan
        if (repayments.length > 0) {
            tableRows.push([{content: 'Repayments:', colSpan: 7, styles: { fontStyle: 'italic', fillColor: [230, 230, 230] }}]);
            repayments.forEach(r => {
                tableRows.push(['', formatDate(r.date), '', '', formatCurrency(r.amount), '', '']);
            });
        }
    });

    doc.autoTable({
        startY: 50,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] }, // Teal header
        didDrawCell: (data) => {
            // Highlight overdue status
            if (data.column.index === 6 && data.cell.section === 'body') {
                if (data.cell.raw === 'Overdue') {
                    doc.setTextColor(255, 0, 0); // Red text
                }
            }
        },
        willDrawCell: (data) => {
             if (data.column.index === 6 && data.cell.section === 'body') {
                 doc.setTextColor(0, 0, 0); // Reset text color for next cell
             }
        }
    });

    doc.save(`${customer.name}_statement_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('PDF statement generated!', 'success');
  };

  const handleDeleteLoan = (loanId, itemSold) => {
      if(window.confirm(`Are you sure you want to delete the loan for "${itemSold}" and its repayments? This cannot be undone.`)) {
          deleteLoan(loanId);
          showToast(`Loan "${itemSold}" deleted successfully.`, 'success');
      }
  };

  const handleDeleteRepayment = (repaymentId, amount) => {
       if(window.confirm(`Are you sure you want to delete the repayment of ${formatCurrency(amount)}? This cannot be undone.`)) {
          deleteRepayment(repaymentId);
          showToast(`Repayment deleted successfully.`, 'success');
      }
  };


  return (
    <div className="p-4 md:p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('dashboard')}
        className="mb-4 inline-flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </button>

      {/* Customer Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{customer.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email} | {customer.phone}</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Total Outstanding: <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(customer.outstandingBalance)}</span>
                </p>
                 <span className={`mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      customer.isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100' :
                      customer.outstandingBalance > 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100' :
                      'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100'
                    }`}>
                      Overall Status: {customer.status}
                </span>
            </div>
        </div>
        <div className="flex space-x-3 mt-4">
            <button
              onClick={() => navigate('addLoan', { customerId: customer.id })}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow text-sm"
            >
              <FilePlus size={16} className="mr-1" /> Add Loan
            </button>
            <button
              onClick={generatePDF}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow text-sm"
            >
              <Download size={16} className="mr-1" /> Export PDF
            </button>
        </div>
      </div>

      {/* Loans Section */}
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Credit Transactions</h3>
      {loans.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-5">No loans recorded for this customer yet.</p>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const repayments = getLoanRepayments(loan.id);
            const totalRepaid = repayments.reduce((sum, r) => sum + r.amount, 0);
            const balance = getLoanBalance(loan);
            const overdue = isLoanOverdue(loan);
            const loanStatus = overdue ? 'Overdue' : (balance <= 0 ? 'Paid' : 'Due');

            return (
              <div key={loan.id} className={`bg-white dark:bg-gray-800 shadow rounded-lg p-4 border-l-4 ${
                  overdue ? 'border-red-500' : (balance <= 0 ? 'border-green-500' : 'border-blue-500')
              }`}>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">{loan.itemSold}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Loan Date: {formatDate(loan.date)} | Due Date: {formatDate(loan.dueDate)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className={`font-bold text-xl ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                            {formatCurrency(loan.amount)}
                        </p>
                        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            overdue ? 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100' :
                            balance <= 0 ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100'
                        }`}>
                            {loanStatus}
                        </span>
                    </div>
                </div>

                 <div className="flex justify-between items-center mt-3 mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                          Balance Remaining: <span className="font-semibold">{formatCurrency(balance)}</span>
                      </p>
                      <div className="flex space-x-2">
                          {balance > 0 && (
                              <button
                                onClick={() => navigate('recordRepayment', { loanId: loan.id, customerId: customer.id })}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-lg flex items-center transition duration-150 ease-in-out shadow text-xs"
                              >
                                <DollarSign size={14} className="mr-1" /> Record Payment
                              </button>
                          )}
                          <button
                              onClick={() => handleDeleteLoan(loan.id, loan.itemSold)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-700"
                              title="Delete Loan"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                 </div>


                {/* Repayments List */}
                {repayments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Repayment History:</h4>
                    <ul className="space-y-1 text-sm">
                      {repayments.map(repayment => (
                        <li key={repayment.id} className="flex justify-between items-center text-gray-700 dark:text-gray-300 pr-1">
                          <span>{formatDate(repayment.date)} - <span className="font-medium">{formatCurrency(repayment.amount)}</span></span>
                          <button
                              onClick={() => handleDeleteRepayment(repayment.id, repayment.amount)}
                              className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-gray-600 opacity-50 hover:opacity-100 transition-opacity"
                              title="Delete Repayment"
                          >
                              <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                 {repayments.length === 0 && balance > 0 && (
                     <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">No repayments recorded yet for this loan.</p>
                 )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Add Customer Page
const AddCustomerPage = ({ navigate }) => {
  const { addCustomer } = useData();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Customer name is required.');
      showToast('Customer name is required.', 'error');
      return;
    }
    // Basic phone validation (optional, simple check for digits)
    if (phone.trim() && !/^\d+$/.test(phone.trim())) {
        setError('Phone number should contain only digits.');
        showToast('Invalid phone number.', 'error');
        return;
    }

    addCustomer({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    showToast('Customer added successfully!', 'success');
    navigate('dashboard'); // Go back to dashboard after adding
  };

  return (
    <div className="p-4 md:p-6">
        <button
            onClick={() => navigate('dashboard')}
            className="mb-4 inline-flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </button>
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Add New Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="customerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter customer's full name"
            />
          </div>
          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address (Optional)</label>
            <input
              type="email"
              id="customerEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="customer@example.com"
            />
          </div>
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              id="customerPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter phone number"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Loan Page
const AddLoanPage = ({ navigate, params }) => {
  const { customerId } = params;
  const { customers, addLoan } = useData();
  const { showToast } = useToast();
  const [itemSold, setItemSold] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const customer = customers.find(c => c.id === customerId);

  if (!customer) {
    // Should not happen if navigation is correct, but good practice
    return <div className="p-6 text-center text-red-500">Customer not found. Cannot add loan.</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!itemSold.trim() || !amount || !dueDate) {
      setError('All fields (Item Sold, Amount, Due Date) are required.');
      showToast('Please fill all required fields.', 'error');
      return;
    }
    const loanAmount = parseFloat(amount);
    if (isNaN(loanAmount) || loanAmount <= 0) {
      setError('Please enter a valid positive amount.');
      showToast('Invalid loan amount.', 'error');
      return;
    }
     try {
        new Date(dueDate).toISOString(); // Check if dueDate is valid
    } catch (e) {
        setError('Invalid due date format.');
        showToast('Invalid due date.', 'error');
        return;
    }

    addLoan({
      customerId,
      itemSold: itemSold.trim(),
      amount: loanAmount,
      date: new Date().toISOString().split('T')[0], // Today's date
      dueDate,
    });

    showToast('Loan added successfully!', 'success');
    navigate('customerDetail', { customerId }); // Go back to customer detail page
  };

  return (
    <div className="p-4 md:p-6">
        <button
            onClick={() => navigate('customerDetail', { customerId })}
            className="mb-4 inline-flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
            <ArrowLeft size={16} className="mr-1" /> Back to Customer Details
        </button>
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Add New Loan</h2>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-6">For Customer: <span className="font-medium">{customer.name}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="itemSold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Sold / Service <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="itemSold"
              value={itemSold}
              onChange={(e) => setItemSold(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Groceries, Tailoring"
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Amount (INR) <span className="text-red-500">*</span></label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              min={new Date().toISOString().split('T')[0]} // Minimum date is today
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Add Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Record Repayment Page
const RecordRepaymentPage = ({ navigate, params }) => {
  const { loanId, customerId } = params; // Receive both loanId and customerId
  const { loans, addRepayment, getLoanBalance } = useData();
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [repaymentDate, setRepaymentDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [error, setError] = useState('');

  const loan = loans.find(l => l.id === loanId);

  if (!loan) {
    return <div className="p-6 text-center text-red-500">Loan not found. Cannot record repayment.</div>;
  }

  const currentBalance = getLoanBalance(loan);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const repaymentAmount = parseFloat(amount);
    if (isNaN(repaymentAmount) || repaymentAmount <= 0) {
      setError('Please enter a valid positive repayment amount.');
      showToast('Invalid repayment amount.', 'error');
      return;
    }
    if (repaymentAmount > currentBalance) {
      setError(`Repayment amount cannot exceed the remaining balance of ${formatCurrency(currentBalance)}.`);
      showToast('Repayment exceeds balance.', 'error');
      return;
    }
     if (!repaymentDate) {
        setError('Please select a repayment date.');
        showToast('Repayment date is required.', 'error');
        return;
    }

    addRepayment({
      loanId,
      amount: repaymentAmount,
      date: repaymentDate,
    });

    showToast('Repayment recorded successfully!', 'success');
    navigate('customerDetail', { customerId }); // Navigate back using customerId
  };

  return (
    <div className="p-4 md:p-6">
        <button
            onClick={() => navigate('customerDetail', { customerId })}
            className="mb-4 inline-flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
            <ArrowLeft size={16} className="mr-1" /> Back to Customer Details
        </button>
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Record Repayment</h2>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-4">For Loan: <span className="font-medium">{loan.itemSold}</span> (Amount: {formatCurrency(loan.amount)})</p>
         <p className="text-md text-gray-600 dark:text-gray-400 mb-6">Current Balance: <span className="font-medium">{formatCurrency(currentBalance)}</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="repaymentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repayment Amount (INR) <span className="text-red-500">*</span></label>
            <input
              type="number"
              id="repaymentAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              max={currentBalance} // Set max value to current balance
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={`Enter amount (up to ${formatCurrency(currentBalance)})`}
            />
          </div>
          <div>
            <label htmlFor="repaymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repayment Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              id="repaymentDate"
              value={repaymentDate}
              onChange={(e) => setRepaymentDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              max={new Date().toISOString().split('T')[0]} // Max date is today
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              disabled={currentBalance <= 0} // Disable if balance is zero or less
            >
              {currentBalance <= 0 ? 'Loan Already Paid' : 'Record Repayment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main App Component (Router) ---
function App() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard'); // Default page after login
  const [pageParams, setPageParams] = useState({}); // To pass data between pages (e.g., customerId)

  // Simple navigation function
  const navigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  // Render different page components based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage navigate={navigate} />;
      case 'customerDetail':
        return <CustomerDetailPage navigate={navigate} params={pageParams} />;
      case 'addCustomer':
        return <AddCustomerPage navigate={navigate} />;
      case 'addLoan':
        return <AddLoanPage navigate={navigate} params={pageParams} />;
      case 'recordRepayment':
        return <RecordRepaymentPage navigate={navigate} params={pageParams} />;
      default:
        return <DashboardPage navigate={navigate} />; // Fallback to dashboard
    }
  };

  // If not authenticated, show Login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // If authenticated, show the main app layout
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar currentPage={currentPage} navigate={navigate} />
      <main className="container mx-auto max-w-7xl">
        {renderPage()}
      </main>
       <footer className="text-center py-4 mt-8 text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
            CrediKhaata © {new Date().getFullYear()} | Simple Loan Ledger
        </footer>
    </div>
  );
}

// Wrap App with Context Providers
export default function CrediKhaataApp() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
            {/* Load Tailwind CDN - In a real setup, this would be part of your build process */}
            <script src="https://cdn.tailwindcss.com"></script>
            {/* Load Lucide Icons - In a real setup, install via npm */}
            {/* <script src="https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.min.js"></script> */}
            {/* Load jsPDF and autoTable - In a real setup, install via npm */}
            {/* <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script> */}
            {/* <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script> */}
             <App />
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}
