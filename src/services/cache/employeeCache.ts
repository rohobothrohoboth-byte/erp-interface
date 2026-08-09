// services/cache/employeeCache.ts
class EmployeeCache {
    private static instance: EmployeeCache;
    private cache: Map<string, { data: any; timestamp: number }> = new Map();

    static getInstance() {
        if (!EmployeeCache.instance) {
            EmployeeCache.instance = new EmployeeCache();
        }
        return EmployeeCache.instance;
    }

    set(key: string, data: any) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    get(key: string, maxAge = 5 * 60 * 1000) { // 5 minutes default
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < maxAge) {
            return cached.data;
        }
        return null;
    }

    clear() {
        this.cache.clear();
    }
}