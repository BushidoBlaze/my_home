export type RequestStatus =
    | "active"
    | "done"
    | "rejected"
    | "draft";

export interface Request {
    id: number;
    title: string;
    description: string;
    deadline: string;
    status: RequestStatus;
}