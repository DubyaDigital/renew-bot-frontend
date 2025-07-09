'use server'

import { ServerActionResponse } from "@/types/actions.type"

export async function uploadPdf(pdfFile: File, jsonFile: File): Promise<ServerActionResponse<unknown>> {
    const formData = new FormData()
    formData.append('files', pdfFile)
    formData.append('files', jsonFile)
    // TODO: Update url to the actual url
    const url = `https://renew-ai-bot-plugin-production.up.railway.app/bot-retraining/train-newBook`
    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    })
    if(!response.ok) {
        const errorJson = await response.json()
        return {
            success: false,
            message: errorJson.message
        }
    }
    return {
        success: true,
        data: await response.json()
    }
}