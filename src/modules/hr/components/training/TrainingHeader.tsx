import { useModuleStore } from '@/shared/stores/module.store';

const TrainingHeader = () => {
  const activeModule = useModuleStore((s) => s.activeModule);
  
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-500 mr-3">
            Training 
          </span>& Development
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Central hub for managing employee training programs, tracking progress, and evaluating effectiveness.
        </p>
      </div>
    </section>
  );
};

export default TrainingHeader;