export type AdminOverview = {
    totalClients: number;
    totalWorkers: number;
    activeJobs: number;
    openJobs: number;
    jobsCreatedToday: number;
    jobsCompletedToday: number;
};

export type PrometheusResult = {
    status: string;
    data?: {
        resultType: string;
        result: PrometheusMetric[];
    };
};

export type PrometheusMetric = {
    metric: Record<string, string>;
    values?: [number, string][];
    value?: [number, string];
};
