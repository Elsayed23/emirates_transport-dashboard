'use client';
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import DynamicBreadcrumb from '@/app/(dashboard)/_components/DynamicBreadcrumb';
import { getSpecificTrafficLineData } from '@/app/simple_func/getSpecificData';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Loading from '@/app/(dashboard)/_components/Loading';
import { toast } from 'sonner';
import useTranslation from '@/app/hooks/useTranslation';
import LanguageContext from '@/app/context/LanguageContext';

const page = ({ params: { stationId, schoolId, trafficLineId } }) => {
    const [questions, setQuestions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [trafficLineName, setTrafficLineName] = useState(null);

    const { t } = useTranslation();
    const { language } = useContext(LanguageContext);

    const searchParams = useSearchParams();

    const enStationName = searchParams.get('station');
    const arSchoolName = searchParams.get('ar_school');
    const enSchoolName = searchParams.get('en_school');

    const router = useRouter();

    const getTrafficLine = useCallback(async () => {
        try {
            const { name } = await getSpecificTrafficLineData(trafficLineId);
            if (!name) {
                router.push(`/stations/${stationId}/school/${schoolId}`);
                toast.error(t('The itinerary does not exist'));
            } else {
                setTrafficLineName(name);
            }
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    }, [trafficLineId, stationId, schoolId, router, t]);

    useEffect(() => {
        getTrafficLine();
    }, []);

    const getRisks = useCallback(async () => {
        try {
            const { data } = await axios.get(`/api/risks?traffic_line_id=${trafficLineId}`);
            console.log(data.allQuestionAnswers);

            setQuestions(data.allQuestionAnswers);
        } catch (error) {
            console.log(error);
        }
    }, [trafficLineId]);

    useEffect(() => {
        getRisks();
    }, []);

    const handleAnswerChange = useCallback((id, answer) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q.question.id === id ? { ...q, response: answer } : q
            )
        );
    }, []);

    const breadcrumbData = useMemo(() => [
        { url: '/stations', title: t('stations') },
        { url: `/stations/${stationId}`, title: t(`stationsData.${enStationName}`) },
        { url: `/stations/${stationId}/school/${schoolId}`, title: language === 'ar' ? arSchoolName : enSchoolName },
        { url: `/stations/${stationId}/school/${schoolId}/trafficLine/${trafficLineId}`, title: trafficLineName },
        { title: t('Update risks') }
    ], [stationId, schoolId, trafficLineId, enStationName, arSchoolName, enSchoolName, trafficLineName, t, language]);

    const allTheAnswersFromQuestions = useMemo(() => questions?.map(({ response }) => response), [questions]);

    const handleSubmit = useCallback(async () => {
        try {
            if (allTheAnswersFromQuestions.includes('غير مجاب عليها')) {
                toast.error(t('You must answer all questions'));
            } else {
                setIsSubmitting(true);
                const dataSending = questions.map(q => ({
                    questionId: q.question.id,
                    response: q.response,
                }));
                console.log(dataSending);

                await axios.patch('/api/risks', {
                    trafficLineId,
                    questionAnswers: dataSending
                });
                toast.success(t('The answers have been saved successfully'));
                router.push(`/stations/${stationId}/school/${schoolId}/trafficLine/${trafficLineId}`);
            }
        } catch (error) {
            console.log(error);
        }
    }, [allTheAnswersFromQuestions, questions, router, stationId, schoolId, trafficLineId, t]);

    const questionCard = useMemo(() => (
        questions?.map(({ question, response }, idx) => (
            <div key={idx} className='flex flex-col items-start gap-3 py-2 border-b'>
                <span className="flex-1">{idx + 1}- {language === 'ar' ? question.question : question.translatedQuestion}</span>
                <div className="flex items-center gap-2">
                    <Button size='sm' className={`${response === 'نعم' && 'bg-green-800 hover:bg-green-700'}`} onClick={() => handleAnswerChange(question.id, 'نعم')}>{t('نعم')}</Button>
                    <Button size='sm' className={`${response === 'لا' && 'bg-red-800 hover:bg-red-700'}`} onClick={() => handleAnswerChange(question.id, 'لا')}>{t('لا')}</Button>
                    <Button size='sm' className={`${response === 'لا ينطبق' && 'bg-slate-500 hover:bg-slate-400'}`} onClick={() => handleAnswerChange(question.id, 'لا ينطبق')}>{t('لا ينطبق')}</Button>
                </div>
                {response !== 'غير مجاب عليها' && <span className={`text-sm font-semibold mt-2 ${response === 'لا' ? 'text-red-700' : response === 'نعم' ? 'text-green-700' : 'text-[#111]'}`}>{t('the answer')}: {t(response)}</span>}
            </div>
        ))
    ), [questions, handleAnswerChange, language, t]);

    return (
        !loading ?
            <div className='p-6'>
                <DynamicBreadcrumb routes={breadcrumbData} />
                <div className="min-h-[calc(100vh-148px)] flex flex-col justify-center items-center">
                    <div className="w-full p-4 max-w-xl my-12 max-h-[650px] border overflow-y-scroll bg-white rounded-lg shadow-md flex flex-col gap-5">
                        {questionCard}
                        <Button onClick={handleSubmit} disabled={isSubmitting}>{t('Save')}</Button>
                    </div>
                </div>
            </div>
            :
            <Loading />
    );
};

export default page;
