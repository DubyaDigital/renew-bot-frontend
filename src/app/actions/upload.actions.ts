'use server'

import { ServerActionResponse } from "@/types/actions.type"

export async function uploadPdf(pdfFile: File, jsonFile: File): Promise<ServerActionResponse<unknown>> {
    const formData = new FormData()
    formData.append('files', pdfFile)
    formData.append('files', jsonFile)
    // TODO: Update url to the actual url
    const url = `/api/upload`
    const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
    if(!response.ok) {
        return {
            success: false,
            message: 'Failed to upload files'
        }
    }
    return {
        success: true,
        data: await response.json()
    }
}