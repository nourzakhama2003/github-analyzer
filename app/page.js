import AnalyzerContainer from '@/components/AnalyzerContainer';

export const metadata = {
  title: 'GitHub Repository Analyzer - Analyze & Insights',
  description: 'Analyze GitHub repositories for activity, complexity, and learning difficulty using advanced scoring formulas',
};

export default function Home() {
  return <AnalyzerContainer />;
}
