class ApiResponse{
    constructor(statusCode, message, data="Success"){
        this.statusCode=statusCode
        this.message=message
        this.data=data
        this.success=statusCode<400
    }   
}

// status code
// 100-199: Informational responses
// 200-299: Successful responses
// 300-399: Redirection messages
// 400-499: Client error responses
// 500-599: Server error responses