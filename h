[1mdiff --git a/src/components/charts/ExpensePieChart.tsx b/src/components/charts/ExpensePieChart.tsx[m
[1mindex 4e6d5cd..3050996 100644[m
[1m--- a/src/components/charts/ExpensePieChart.tsx[m
[1m+++ b/src/components/charts/ExpensePieChart.tsx[m
[36m@@ -21,6 +21,36 @@[m [mChartJS.register([m
   Colors[m
 );[m
 [m
[32m+[m[32m// Vibrant color palette (Duolingo-inspired)[m
[32m+[m[32mconst appColors = {[m
[32m+[m[32m  primary: 'rgba(88, 204, 2, 0.8)',     // Bright green[m[41m [m
[32m+[m[32m  secondary: 'rgba(77, 56, 202, 0.8)',  // Indigo[m
[32m+[m[32m  accent1: 'rgba(255, 88, 0, 0.8)',     // Orange[m
[32m+[m[32m  accent2: 'rgba(255, 63, 128, 0.8)',   // Magenta[m
[32m+[m[32m  accent3: 'rgba(0, 184, 216, 0.8)',    // Teal[m
[32m+[m[32m  accent4: 'rgba(255, 200, 0, 0.8)',    // Yellow[m
[32m+[m[32m  accent5: 'rgba(175, 82, 222, 0.8)',   // Purple[m
[32m+[m[32m  accent6: 'rgba(255, 138, 76, 0.8)',   // Coral[m
[32m+[m[32m  accent7: 'rgba(46, 196, 182, 0.8)',   // Turquoise[m
[32m+[m[32m  accent8: 'rgba(231, 29, 54, 0.8)',    // Red[m
[32m+[m[32m  gray: 'rgba(240, 240, 240, 0.8)'      // Light gray[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32m// Corresponding border colors (more solid versions)[m
[32m+[m[32mconst borderColors = {[m
[32m+[m[32m  primary: 'rgba(88, 204, 2, 1)',[m
[32m+[m[32m  secondary: 'rgba(77, 56, 202, 1)',[m
[32m+[m[32m  accent1: 'rgba(255, 88, 0, 1)',[m
[32m+[m[32m  accent2: 'rgba(255, 63, 128, 1)',[m
[32m+[m[32m  accent3: 'rgba(0, 184, 216, 1)',[m
[32m+[m[32m  accent4: 'rgba(255, 200, 0, 1)',[m
[32m+[m[32m  accent5: 'rgba(175, 82, 222, 1)',[m
[32m+[m[32m  accent6: 'rgba(255, 138, 76, 1)',[m
[32m+[m[32m  accent7: 'rgba(46, 196, 182, 1)',[m
[32m+[m[32m  accent8: 'rgba(231, 29, 54, 1)',[m
[32m+[m[32m  gray: 'rgba(240, 240, 240, 1)'[m
[32m+[m[32m};[m
[32m+[m
 export default function ExpensePieChart() {[m
   const expenses = useBudgetStore((state) => state.expenses);[m
   const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);[m
[36m@@ -55,28 +85,28 @@[m [mexport default function ExpensePieChart() {[m
       {[m
         data: Object.values(expensesByCategory),[m
         backgroundColor: [[m
[31m-          'rgba(255, 99, 132, 0.7)',   // Pink[m
[31m-          'rgba(54, 162, 235, 0.7)',   // Blue[m
[31m-          'rgba(255, 206, 86, 0.7)',   // Yellow[m
[31m-          'rgba(75, 192, 192, 0.7)',   // Teal[m
[31m-          'rgba(153, 102, 255, 0.7)',  // Purple[m
[31m-          'rgba(255, 159, 64, 0.7)',   // Orange[m
[31m-          'rgba(94, 234, 212, 0.7)',   // Turquoise[m
[31m-          'rgba(249, 115, 22, 0.7)',   // Amber[m
[31m-          'rgba(16, 185, 129, 0.7)',   // Green[m
[31m-          'rgba(168, 85, 247, 0.7)',   // Lavender[m
[32m+[m[32m          appColors.primary,[m
[32m+[m[32m          appColors.secondary,[m
[32m+[m[32m          appColors.accent1,[m
[32m+[m[32m          appColors.accent2,[m
[32m+[m[32m          appColors.accent3,[m
[32m+[m[32m          appColors.accent4,[m
[32m+[m[32m          appColors.accent5,[m
[32m+[m[32m          appColors.accent6,[m
[32m+[m[32m          appColors.accent7,[m
[32m+[m[32m          appColors.accent8,[m
         ],[m
         borderColor: [[m
[31m-          'rgba(255, 99, 132, 1)',[m
[31m-          'rgba(54, 162, 235, 1)',[m
[31m-          'rgba(255, 206, 86, 1)',[m
[31m-          'rgba(75, 192, 192, 1)',[m
[31m-          'rgba(153, 102, 255, 1)',[m
[31m-          'rgba(255, 159, 64, 1)',[m
[31m-          'rgba(94, 234, 212, 1)',[m
[31m-          'rgba(249, 115, 22, 1)',[m
[31m-          'rgba(16, 185, 129, 1)',[m
[31m-          'rgba(168, 85, 247, 1)',[m
[32m+[m[32m          borderColors.primary,[m
[32m+[m[32m          borderColors.secondary,[m
[32m+[m[32m          borderColors.accent1,[m
[32m+[m[32m          borderColors.accent2,[m
[32m+[m[32m          borderColors.accent3,[m
[32m+[m[32m          borderColors.accent4,[m
[32m+[m[32m          borderColors.accent5,[m
[32m+[m[32m          borderColors.accent6,[m
[32m+[m[32m          borderColors.accent7,[m
[32m+[m[32m          borderColors.accent8,[m
         ],[m
         borderWidth: 2,[m
         hoverOffset: 15[m
[36m@@ -114,7 +144,7 @@[m [mexport default function ExpensePieChart() {[m
         titleFont: {[m
           family: 'Inter, sans-serif',[m
           size: 14,[m
[31m-          weight: 'bold'[m
[32m+[m[32m          weight: 'bold' as const[m
         },[m
         padding: 12,[m
         cornerRadius: 8,[m
[36m@@ -137,7 +167,7 @@[m [mexport default function ExpensePieChart() {[m
       animateScale: true,[m
       animateRotate: true,[m
       duration: 800,[m
[31m-      easing: 'easeOutQuart'[m
[32m+[m[32m      easing: 'easeOutQuart' as const[m
     }[m
   };[m
 [m
[36m@@ -154,8 +184,22 @@[m [mexport default function ExpensePieChart() {[m
   }[m
 [m
   return ([m
[31m-    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">[m
[31m-      <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Expenses by Category</h3>[m
[32m+[m[32m    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative overflow-hidden">[m
[32m+[m[32m      {/* Decorative background element */}[m
[32m+[m[32m      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>[m
[32m+[m[41m      [m
[32m+[m[32m      <div className="flex items-center mb-4">[m
[32m+[m[32m        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">[m
[32m+[m[32m          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">[m
[32m+[m[32m            <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>[m
[32m+[m[32m            <path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path>[m
[32m+[m[32m            <path d="M12 12l8.5 8.5"></path>[m
[32m+[m[32m            <path d="M12 12l-8.5 8.5"></path>[m
[32m+[m[32m          </svg>[m
[32m+[m[32m        </div>[m
[32m+[m[32m        <h3 className="text-lg font-medium text-gray-900">Monthly Expenses by Category</h3>[m
[32m+[m[32m      </div>[m
[32m+[m[41m      [m
       <div className="h-64">[m
         <Pie data={chartData} options={chartOptions} />[m
       </div>[m
