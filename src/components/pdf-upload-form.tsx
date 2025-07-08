'use client'

import { uploadPdf } from '@/app/actions/upload.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState, useRef } from 'react'
import { toast } from 'sonner'

interface SelectedFiles {
    pdf: File | null
    json: File | null
}

function PdfUploadForm() {
    const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({ pdf: null, json: null })
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
    const ALLOWED_MIME_TYPES = ['application/pdf', 'application/json']

    const validateFile = (file: File): boolean => {
        if (file.size > MAX_FILE_SIZE) {
            setError(`File size exceeds 10MB limit. Selected file is ${(file.size / 1024 / 1024).toFixed(2)}MB`)
            return false
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            setError('Only PDF or JSON files are allowed')
            return false
        }

        // Clear any previous error if validation passes
        setError('')
        return true
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            processFiles(files)
        }
    }

    const processFiles = (files: File[]) => {
        const newSelectedFiles: SelectedFiles = { ...selectedFiles }
        let hasError = false

        files.forEach(file => {
            if (!validateFile(file)) {
                hasError = true
                return
            }

            if (file.type === 'application/pdf') {
                if (newSelectedFiles.pdf) {
                    setError('Only one PDF file is allowed')
                    hasError = true
                    return
                }
                newSelectedFiles.pdf = file
            } else if (file.type === 'application/json') {
                if (newSelectedFiles.json) {
                    setError('Only one JSON file is allowed')
                    hasError = true
                    return
                }
                newSelectedFiles.json = file
            }
        })

        if (!hasError) {
            setSelectedFiles(newSelectedFiles)
            setError('')
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            processFiles(files)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedFiles.pdf && selectedFiles.json) {
            try {
                setIsUploading(true)
                // You might need to update your upload action to handle multiple files
                const response = await uploadPdf(selectedFiles.pdf, selectedFiles.json)
                if(!response.success) {
                    throw new Error("Something went wrong")
                }   
                toast.success('Files uploaded successfully')
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Something went wrong')
            } finally {
                setIsUploading(false)
            }
        }
    }

    const handleAreaClick = () => {
        fileInputRef.current?.click()
    }

    const removeFile = (fileType: 'pdf' | 'json') => {
        setSelectedFiles(prev => ({ ...prev, [fileType]: null }))
        setError('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const isFormValid = selectedFiles.pdf && selectedFiles.json && !error

    return (
        <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Error Display */}
            {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                    <div className='flex items-center'>
                        <svg className='w-5 h-5 text-red-500 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <p className='text-red-700 font-medium'>{error}</p>
                    </div>
                </div>
            )}

            {/* Drag and Drop Area */}
            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer ${dragActive
                        ? 'border-primary bg-amber-50'
                        : error
                            ? 'border-red-300 bg-red-50/50'
                            : 'border-gray-300 hover:border-primary/50 hover:bg-amber-50/50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleAreaClick}
            >
                <div className='text-center'>
                    <div className='mx-auto w-16 h-16 bg-gradient-to-br from-primary to-amber-600 rounded-full flex items-center justify-center mb-4'>
                        <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
                        </svg>
                    </div>

                    <div className='cursor-pointer'>
                        <span className='text-xl font-semibold text-gray-700 hover:text-primary transition-colors'>
                            {dragActive ? 'Drop your files here' : 'Click to upload or drag and drop'}
                        </span>
                    </div>

                    <p className='text-sm text-gray-500 mt-2'>
                        One PDF and one JSON file required • Up to 10MB each
                    </p>

                    <Input
                        ref={fileInputRef}
                        type='file'
                        accept='application/pdf,application/json'
                        multiple
                        className='hidden'
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {/* Selected Files Display */}
            {(selectedFiles.pdf || selectedFiles.json) && (
                <div className='bg-amber-50 rounded-xl p-4 border border-amber-200'>
                    <h3 className='font-semibold text-gray-700 mb-3 flex items-center'>
                        <svg className='w-5 h-5 mr-2 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        Selected Files
                    </h3>
                    
                    {/* PDF File Display */}
                    {selectedFiles.pdf && (
                        <div className='bg-white p-3 rounded-lg border border-amber-200 mb-3'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-3'>
                                    <div className='w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center'>
                                        <svg className='w-4 h-4 text-red-600' fill='currentColor' viewBox='0 0 24 24'>
                                            <path d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className='font-medium text-gray-800'>{selectedFiles.pdf.name}</p>
                                        <p className='text-sm text-gray-500'>{(selectedFiles.pdf.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
                                        PDF
                                    </span>
                                    <button
                                        type='button'
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removeFile('pdf')
                                        }}
                                        className='text-red-500 hover:text-red-700 transition-colors'
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* JSON File Display */}
                    {selectedFiles.json && (
                        <div className='bg-white p-3 rounded-lg border border-amber-200'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-3'>
                                    <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                                        <svg className='w-4 h-4 text-blue-600' fill='currentColor' viewBox='0 0 24 24'>
                                            <path d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className='font-medium text-gray-800'>{selectedFiles.json.name}</p>
                                        <p className='text-sm text-gray-500'>{(selectedFiles.json.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                                        JSON
                                    </span>
                                    <button
                                        type='button'
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removeFile('json')
                                        }}
                                        className='text-red-500 hover:text-red-700 transition-colors'
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Missing Files Warning */}
                    {(!selectedFiles.pdf || !selectedFiles.json) && (
                        <div className='mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                            <div className='flex items-center'>
                                <svg className='w-4 h-4 text-yellow-600 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
                                </svg>
                                <p className='text-sm text-yellow-700'>
                                    {!selectedFiles.pdf && !selectedFiles.json 
                                        ? 'Please select both PDF and JSON files'
                                        : !selectedFiles.pdf 
                                            ? 'Please select a PDF file'
                                            : 'Please select a JSON file'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Button */}
            <div className='pt-4'>
                <Button
                    type='submit'
                    className='w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl'
                    disabled={!isFormValid || isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Upload Files'}
                </Button>
            </div>
        </form>
    )
}

export default PdfUploadForm