// src/pages/VacanciesPage.tsx

import { useParams } from "react-router-dom";
import VacancyHeader from "../../components/vacancy/VacancyHeader";
import VacanciesSection from "../../components/vacancy/VacanciesSection";
import VacancyDetailSection from "../../components/vacancy/VacancyDetailSection";

export default function VacanciesPage() {
    const { id } = useParams();

    // If there's an ID, show detail section, otherwise show list section
    const isDetailView = !!id;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/30">
            <VacancyHeader
                backTo={isDetailView ? "/vacancies" : "/modules"}
                backLabel={isDetailView ? "Back to Vacancies" : "Back to Modules"}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isDetailView ? <VacancyDetailSection /> : <VacanciesSection />}
            </main>
        </div>
    );
}