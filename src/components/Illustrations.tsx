'use client';

export function WelcomeIllustration() {
  return (
    <div className="w-full h-48 relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <path d="M0,50 Q30,30 50,50 T100,50 V100 H0 Z" fill="currentColor" className="text-white" />
          <path d="M0,60 Q35,80 50,60 T100,60 V100 H0 Z" fill="currentColor" className="text-white" />
        </svg>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full flex items-center">
        <div className="px-8 text-white">
          <h2 className="text-2xl font-bold">Welcome to Finny</h2>
          <p className="mt-2 max-w-md">Track your finances, earn rewards, and achieve your financial goals!</p>
        </div>
      </div>
      
      <div className="absolute right-6 bottom-0">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white opacity-80">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 17.5V17.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 14.5C12 13 13.5 13 13.5 12C13.5 11 12.5 10.5 12 10.5C11.5 10.5 10.5 11 10.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M7 8.50958C8.3044 7.53892 10.0214 7 11.8182 7C13.7143 7 15.5169 7.5967 16.8485 8.66055" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export function FinancialHealthCard({ score }: { score: number }) {
  const getGradientClass = () => {
    if (score >= 80) return 'from-emerald-500 to-green-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-pink-500';
  };

  const getLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="relative bg-white rounded-xl shadow-sm p-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50"></div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-4 relative z-10">Financial Health Score</h2>
      
      <div className="relative z-10">
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${getGradientClass()}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getGradientClass()} flex items-center justify-center shadow-md`}>
              <span className="text-2xl font-bold text-white">{score}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getGradientClass()}`}>
            {getLabel()}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-3">
          Your financial health is {getLabel().toLowerCase()}. {score >= 60 
            ? 'Keep up the good work!' 
            : 'Focus on reducing expenses and building savings.'}
        </p>
      </div>
    </div>
  );
}

export function SavingsGoalCard({ 
  current, 
  target, 
  title = "Vacation Fund", 
  icon = "✈️" 
}: { 
  current: number; 
  target: number; 
  title?: string; 
  icon?: string;
}) {
  const percentage = Math.min(Math.floor((current / target) * 100), 100);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm">Savings Goal</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{percentage}%</span>
        </div>
        
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-end mt-3">
          <div>
            <div className="text-sm text-gray-500 mb-1">Current savings</div>
            <div className="text-2xl font-bold text-indigo-700">${current.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Target</div>
            <div className="text-lg font-medium text-gray-800">${target.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BudgetComparisonCard({ categories }: { categories: Array<{name: string; budgeted: number; spent: number}> }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget vs. Spending</h2>
      
      <div className="space-y-4">
        {categories.map(category => {
          const percentage = Math.floor((category.spent / category.budgeted) * 100);
          const isOverBudget = percentage > 100;
          
          return (
            <div key={category.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-800">{category.name}</span>
                <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  ${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}
                </span>
              </div>
              
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    isOverBudget 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                      : percentage > 80 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              
              {isOverBudget && (
                <div className="text-xs text-red-600 mt-1">
                  ${(category.spent - category.budgeted).toLocaleString()} over budget
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 