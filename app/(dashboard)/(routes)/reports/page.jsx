'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Card from './_components/Card'
import DynamicBreadcrumb from '../../_components/DynamicBreadcrumb'
import useTranslation from '@/app/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Loading from '../../_components/Loading'
import { useAuth } from '@/app/context/AuthContext'
import { toast } from 'sonner'

const page = () => {

    const [reportsData, setReportsData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [toggleDeleteReport, setToggleDeleteReport] = useState(false)

    const { user } = useAuth()

    const { t } = useTranslation()

    const getReports = async () => {
        try {
            if (user) {
                const { data } = await axios.get(`/api/reports?user_id=${user?.id}`)
                setReportsData(data)
                console.log(data);

                setLoading(false)
            }


        } catch (error) {
            console.log(error);
        }
    }

    const handleDeleteReport = async (id) => {
        try {

            await axios.delete(`/api/reports/${id}`)

            toast.success(t('The report has been successfully deleted'))
            setToggleDeleteReport(prev => !prev)

        } catch (error) {
            console.log(error);
        }
    }

    const reportsCard = reportsData?.map((card, idx) => {
        return (
            <Card key={idx} handleDeleteReport={handleDeleteReport} {...card} />
        )
    })
    useEffect(() => {
        getReports()
        console.log(toggleDeleteReport);
    }, [user, toggleDeleteReport])


    const router = useRouter()


    const breadcrumbData = [
        {
            url: '/reports',
            title: t('reports')
        },
    ]

    if (loading) return <Loading />


    return (
        <div className="p-6 min-h-[calc(100vh-80px)]">
            <div className="flex flex-col gap-9">
                <DynamicBreadcrumb routes={breadcrumbData} />
                {
                    user?.role?.name === 'SAFETY_OFFICER'
                        ?
                        <Button className='w-fit' onClick={() => router.push('/reports/create')}>{t('Create a report')}</Button>
                        :
                        null
                }
                <div className="grid grid-cols-2 gap-6">
                    {reportsCard}
                </div>
            </div>
        </div>
    )
}

export default page