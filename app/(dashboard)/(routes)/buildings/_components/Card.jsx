'use client'
import useTranslation from '@/app/hooks/useTranslation'
import { useRouter } from 'next/navigation'
import React, { useContext, useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FaXmark } from 'react-icons/fa6'
import LanguageContext from '@/app/context/LanguageContext'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'

const Card = ({
    id,
    user,
    name,
    cityName,
    handleDeleteBuilt,
    createdAt
}) => {

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const router = useRouter()

    const { t } = useTranslation()

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setIsDialogOpen(true);
    }

    const { language } = useContext(LanguageContext)

    const main = useAuth()

    const confirmDelete = (e) => {
        e.stopPropagation();
        handleDeleteBuilt(id);
        setIsDialogOpen(false);
    }

    const handleCancelClick = (e) => {
        e.stopPropagation();
        setIsDialogOpen(false);
    }

    const handleDialogClick = (e) => {
        e.stopPropagation();
    }

    return (
        <div onClick={() => router.push(`/buildings/${id}?built=${name}`)} className={`border relative shadow-lg hover:scale-[1.03] duration-200 text-[#111] flex flex-col items-center gap-3 rounded-sm cursor-pointer p-4`}>

            <h2 className='text-lg font-semibold'>{name}</h2>
            <h2>المدينة: {cityName}</h2>
            <h2>{t('Date created')} {new Date(createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', })}</h2>
            <p>المبني مسجل بإسم: <span className='font-semibold'>{user.name}</span></p>
            {
                main?.user?.id === user?.id || main?.user?.role?.name === 'ADMIN'
                    ?
                    <div className="absolute top-2 right-2">
                        <Button variant='destructive' size='icon' className='self-start rounded-full w-8 h-8' onClick={handleDeleteClick}>
                            <FaXmark size={18} />
                        </Button>
                    </div>
                    :
                    null
            }
            {isDialogOpen && (
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <div onClick={handleDialogClick}>
                        <AlertDialogContent>
                            <AlertDialogHeader className='sm:text-center'>
                                <AlertDialogTitle>{t('Are you absolutely sure')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('This action cannot be undone')}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={handleCancelClick}>{t('Cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDelete}>{t('Delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </div>
                </AlertDialog>
            )}
        </div>
    )
}

export default Card