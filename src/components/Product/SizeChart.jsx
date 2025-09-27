import React from 'react';

// --- Component Data ---

// Data for the main sizing guide table
const sizingData = [
  { size: 'XS-elene', waistIn: '23.5"-26"', hipIn: '34"-36.5"', waistCm: '60-66', hipCm: '86-93' },
  { size: 'S-elene', waistIn: '26.5"-29"', hipIn: '37"-39.5"', waistCm: '68-74', hipCm: '94-100' },
  { size: 'M-aia', waistIn: '29.5"-32"', hipIn: '40"-42.5"', waistCm: '75-81', hipCm: '102-108' },
  { size: 'L-una', waistIn: '32.5"-35"', hipIn: '43"-45.5"', waistCm: '83-89', hipCm: '109-116' },
  { size: 'XL-una', waistIn: '35.5"-39"', hipIn: '46"-49.5"', waistCm: '91-99', hipCm: '117-126' },
  { size: 'XXL-una', waistIn: '39.5"-43"', hipIn: '50"-53.5"', waistCm: '101-109', hipCm: '127-136' },
  { size: 'XXXL-una', waistIn: '43.5-47"', hipIn: '54"-58.5"', waistCm: '111-119', hipCm: '137-149' },
  { size: 'XXXXL-una', waistIn: '47.5"-51"', hipIn: '59"-63.5"', waistCm: '121-130', hipCm: '150-161' },
];

// Data for the size comparison chart
const comparisonData = [
    { region: 'UK', sizes: [8, 10, 12, 14, 16, 18, 20, 22] },
    { region: 'US', sizes: [4, 6, 8, 10, 12, 16, 18, 20] },
];
const blissclubSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'];


// --- Shadcn UI Inspired Table Components (using Tailwind CSS) ---
// These are stateless functional components that apply Tailwind classes to mimic shadcn's table structure.

const Table = ({ children, className }) => (
  <div className="relative w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`}>{children}</table>
  </div>
);

const TableHeader = ({ children, className }) => (
  <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>
);

const TableBody = ({ children, className }) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>
);

const TableRow = ({ children, className }) => (
  <tr className={`border-b transition-colors hover:bg-gray-100/50 ${className}`}>{children}</tr>
);

const TableHead = ({ children, className, ...props }) => (
  <th className={`h-12 px-4 text-center align-middle font-medium text-gray-500 ${className}`} {...props}>
    {children}
  </th>
);

const TableCell = ({ children, className, ...props }) => (
  <td className={`p-4 align-middle ${className}`} {...props}>
    {children}
  </td>
);


// --- Main App Component ---

export default function SizeChart() {
  return (
    <div className="bg-white text-gray-900 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-pink-600 tracking-wide">
                    OUR SIZING GUIDE
                </h1>
                <p className="mt-2 text-md sm:text-lg text-gray-600">
                    Don't know what your size is? Don't worry, we're here to help you!
                </p>
            </div>
            
            {/* Main Sizing Guide Card */}
            <div className="border bg-white text-gray-900 rounded-lg shadow-sm">
                <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-0">
                                <TableHead rowSpan={2} className="align-bottom pb-4 text-lg font-semibold text-gray-900">Size</TableHead>
                                <TableHead colSpan={2} className="border-l">Body Measurement (Inches)</TableHead>
                                <TableHead colSpan={2} className="border-l">Body Measurement (Cms)</TableHead>
                            </TableRow>
                             <TableRow>
                                <TableHead className="font-semibold border-l">Waist</TableHead>
                                <TableHead className="font-semibold border-l">Hip</TableHead>
                                <TableHead className="font-semibold border-l">Waist</TableHead>
                                <TableHead className="font-semibold border-l">Hip</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sizingData.map((row) => (
                                <TableRow key={row.size}>
                                    <TableCell className="font-bold text-md text-gray-900">{row.size}</TableCell>
                                    <TableCell className="border-l">{row.waistIn}</TableCell>
                                    <TableCell className="border-l">{row.hipIn}</TableCell>
                                    <TableCell className="border-l">{row.waistCm}</TableCell>
                                    <TableCell className="border-l">{row.hipCm}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Comparison Chart Section */}
            <div className="text-center my-8">
                <h2 className="text-xl font-bold text-gray-900">Still unsure? Use the size comparison chart below.</h2>
                <p className="text-sm text-gray-600 mt-1 max-w-2xl mx-auto">
                    Universal size guide for comparison. These are general guidelines and for accuracy kindly measure your body in relation to Blissclub sizing.
                </p>
            </div>

             {/* Comparison Chart Card */}
            <div className="border bg-white text-gray-900 rounded-lg shadow-sm">
                 <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50/60">
                                <TableHead className="text-gray-900 font-bold">Blissclub</TableHead>
                                {blissclubSizes.map(size => <TableHead key={size} className="text-gray-900">{size}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {comparisonData.map(row => (
                                <TableRow key={row.region}>
                                   <TableCell className="font-bold text-gray-900">{row.region}</TableCell>
                                   {row.sizes.map((size, index) => <TableCell key={index}>{size}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    </div>
  );
}

