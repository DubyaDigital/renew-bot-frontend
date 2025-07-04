export type ServerActionResponse<T> = {
    success: false
    message: string
} | {
    success: true
    data: T
}