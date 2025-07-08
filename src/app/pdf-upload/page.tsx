import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import PdfUploadForm from '@/components/pdf-upload-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Upload PDF Document',
    description: 'Upload PDF Document',
}

function PdfUploadPage() {
    return (
        <div className='min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4'>
            <Card className='w-full max-w-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm'>
                <CardHeader className='text-center pb-8'>
                    <CardTitle className='text-3xl font-bold bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent'>
                        Upload Documents
                    </CardTitle>
                    <CardDescription className='text-lg text-gray-600 mt-2'>
                        Select one PDF and one JSON file to upload. Drag and drop or click to browse.
                    </CardDescription>
                </CardHeader>
                
                <CardContent className='space-y-6'>
                    <PdfUploadForm />
                </CardContent>
            </Card>
        </div>
    )
}

export default PdfUploadPage