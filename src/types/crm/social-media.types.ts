// src/types/crm/social-media.types.ts

// ============================================================
// ENUMS
// ============================================================

export enum SocialMediaPlatform {
    Facebook = 'Facebook',
    Twitter = 'Twitter',
    Instagram = 'Instagram',
    LinkedIn = 'LinkedIn',
    YouTube = 'YouTube',
    TikTok = 'TikTok',
}

export enum PostStatus {
    Draft = 'Draft',
    Scheduled = 'Scheduled',
    Published = 'Published',
    Failed = 'Failed',
    Pending = 'Pending',
    Cancelled = 'Cancelled',
}

// ============================================================
// VIEW MODEL
// ============================================================

export interface SocialMediaPostViewModel {
    id: string;
    content: string;
    platform: SocialMediaPlatform;
    platformDisplay: string;
    platformIcon: string;
    status: PostStatus;
    statusDisplay: string;
    statusColor: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
    statusBadge: string;
    imageUrl: string | null;
    videoUrl: string | null;
    linkUrl: string | null;
    location: string | null;
    hashtags: string[];
    hashtagsDisplay: string;
    scheduledDate: string | null;
    scheduledDateDisplay: string | null;
    publishedDate: string | null;
    publishedDateDisplay: string | null;
    createdAt: string;
    createdAtDisplay: string;
    updatedAt: string | null;
    updatedAtDisplay: string | null;
    engagementCount: number;
    engagementDisplay: string;
    reachCount: number;
    reachDisplay: string;
    likeCount: number;
    likeDisplay: string;
    shareCount: number;
    shareDisplay: string;
    commentCount: number;
    commentDisplay: string;
    campaignId: string | null;
    campaignName: string | null;
    postId: string | null;
    authorId: string | null;
    authorName: string | null;
    isEditable: boolean;
    isDeletable: boolean;
    canPublish: boolean;
    canCancel: boolean;
    canSchedule: boolean;
    characterCount: number;
    characterLimit: number;
    isOverLimit: boolean;
    timeAgo: string;
    relativeTime: string;
}

// ============================================================
// DTOs
// ============================================================

export interface CreateSocialMediaPostDto {
    content: string;
    platform: SocialMediaPlatform | string;
    status?: PostStatus | string;
    scheduledDate?: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
    location?: string;
    hashtags?: string;
    campaignId?: string;
    mentions?: string[];
}

export interface UpdateSocialMediaPostDto {
    content?: string;
    platform?: SocialMediaPlatform | string;
    status?: PostStatus | string;
    scheduledDate?: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
    location?: string;
    hashtags?: string;
    campaignId?: string;
}

export interface SocialMediaPostResponseDto {
    id: string;
    content: string;
    platform: string;
    imageUrl: string | null;
    videoUrl: string | null;
    linkUrl: string | null;
    location: string | null;
    hashtags: string | null;
    status: string;
    scheduledDate: string | null;
    publishedDate: string | null;
    engagementCount: number;
    reachCount: number;
    likeCount: number;
    shareCount: number;
    commentCount: number;
    postId: string | null;
    campaignId: string | null;
    createdAt: string;
    updatedAt: string | null;
}

// ============================================================
// MAPPER CLASS
// ============================================================

export class SocialMediaPostMapper {
    static toViewModel(
        dto: SocialMediaPostResponseDto,
        campaignName?: string,
        authorName?: string
    ): SocialMediaPostViewModel {
        const platform = dto.platform as SocialMediaPlatform;
        const status = dto.status as PostStatus;

        const hashtags = dto.hashtags
            ? dto.hashtags
                .split(/[\s,]+/)
                .map(h => h.trim())
                .filter(h => h.startsWith('#') || h.length > 0)
            : [];

        const characterLimit = this.getPlatformCharLimit(platform);

        return {
            id: dto.id,
            content: dto.content,
            platform: platform,
            platformDisplay: this.getPlatformDisplayName(platform),
            platformIcon: this.getPlatformIcon(platform),
            status: status,
            statusDisplay: this.getStatusDisplayName(status),
            statusColor: this.getStatusColor(status),
            statusBadge: this.getStatusBadge(status),
            imageUrl: dto.imageUrl,
            videoUrl: dto.videoUrl,
            linkUrl: dto.linkUrl,
            location: dto.location,
            hashtags: hashtags,
            hashtagsDisplay: hashtags.length > 0 ? hashtags.join(' ') : '',
            scheduledDate: dto.scheduledDate,
            scheduledDateDisplay: dto.scheduledDate
                ? new Date(dto.scheduledDate).toLocaleString()
                : null,
            publishedDate: dto.publishedDate,
            publishedDateDisplay: dto.publishedDate
                ? new Date(dto.publishedDate).toLocaleString()
                : null,
            createdAt: dto.createdAt,
            createdAtDisplay: new Date(dto.createdAt).toLocaleString(),
            updatedAt: dto.updatedAt,
            updatedAtDisplay: dto.updatedAt
                ? new Date(dto.updatedAt).toLocaleString()
                : null,
            engagementCount: dto.engagementCount,
            engagementDisplay: this.formatNumber(dto.engagementCount),
            reachCount: dto.reachCount,
            reachDisplay: this.formatNumber(dto.reachCount),
            likeCount: dto.likeCount,
            likeDisplay: this.formatNumber(dto.likeCount),
            shareCount: dto.shareCount,
            shareDisplay: this.formatNumber(dto.shareCount),
            commentCount: dto.commentCount,
            commentDisplay: this.formatNumber(dto.commentCount),
            campaignId: dto.campaignId,
            campaignName: campaignName || null,
            postId: dto.postId,
            authorId: null,
            authorName: authorName || null,
            isEditable: status !== PostStatus.Published && status !== PostStatus.Cancelled,
            isDeletable: status !== PostStatus.Published,
            canPublish: status === PostStatus.Draft || status === PostStatus.Scheduled,
            canCancel: status === PostStatus.Scheduled || status === PostStatus.Pending,
            canSchedule: status === PostStatus.Draft || status === PostStatus.Pending,
            characterCount: dto.content.length,
            characterLimit: characterLimit,
            isOverLimit: dto.content.length > characterLimit,
            timeAgo: this.getTimeAgo(dto.createdAt),
            relativeTime: this.getRelativeTime(dto.createdAt),
        };
    }

    private static getPlatformDisplayName(platform: SocialMediaPlatform): string {
        const map: Record<SocialMediaPlatform, string> = {
            [SocialMediaPlatform.Facebook]: 'Facebook',
            [SocialMediaPlatform.Twitter]: 'Twitter',
            [SocialMediaPlatform.Instagram]: 'Instagram',
            [SocialMediaPlatform.LinkedIn]: 'LinkedIn',
            [SocialMediaPlatform.YouTube]: 'YouTube',
            [SocialMediaPlatform.TikTok]: 'TikTok',
        };
        return map[platform] || platform;
    }

    private static getPlatformIcon(platform: SocialMediaPlatform): string {
        const map: Record<SocialMediaPlatform, string> = {
            [SocialMediaPlatform.Facebook]: '📘',
            [SocialMediaPlatform.Twitter]: '🐦',
            [SocialMediaPlatform.Instagram]: '📸',
            [SocialMediaPlatform.LinkedIn]: '💼',
            [SocialMediaPlatform.YouTube]: '▶️',
            [SocialMediaPlatform.TikTok]: '🎵',
        };
        return map[platform] || '📱';
    }

    private static getPlatformCharLimit(platform: SocialMediaPlatform): number {
        const map: Record<SocialMediaPlatform, number> = {
            [SocialMediaPlatform.Facebook]: 2000,
            [SocialMediaPlatform.Twitter]: 280,
            [SocialMediaPlatform.Instagram]: 2200,
            [SocialMediaPlatform.LinkedIn]: 3000,
            [SocialMediaPlatform.YouTube]: 5000,
            [SocialMediaPlatform.TikTok]: 150,
        };
        return map[platform] || 2000;
    }

    private static getStatusDisplayName(status: PostStatus): string {
        const map: Record<PostStatus, string> = {
            [PostStatus.Draft]: 'Draft',
            [PostStatus.Scheduled]: 'Scheduled',
            [PostStatus.Published]: 'Published',
            [PostStatus.Failed]: 'Failed',
            [PostStatus.Pending]: 'Pending',
            [PostStatus.Cancelled]: 'Cancelled',
        };
        return map[status] || status;
    }

    private static getStatusColor(status: PostStatus): 'green' | 'yellow' | 'blue' | 'red' | 'gray' {
        const map: Record<PostStatus, 'green' | 'yellow' | 'blue' | 'red' | 'gray'> = {
            [PostStatus.Draft]: 'gray',
            [PostStatus.Scheduled]: 'blue',
            [PostStatus.Published]: 'green',
            [PostStatus.Failed]: 'red',
            [PostStatus.Pending]: 'yellow',
            [PostStatus.Cancelled]: 'red',
        };
        return map[status] || 'gray';
    }

    private static getStatusBadge(status: PostStatus): string {
        const map: Record<PostStatus, string> = {
            [PostStatus.Draft]: 'bg-gray-200 text-gray-700',
            [PostStatus.Scheduled]: 'bg-blue-100 text-blue-700',
            [PostStatus.Published]: 'bg-green-100 text-green-700',
            [PostStatus.Failed]: 'bg-red-100 text-red-700',
            [PostStatus.Pending]: 'bg-yellow-100 text-yellow-700',
            [PostStatus.Cancelled]: 'bg-red-100 text-red-700',
        };
        return map[status] || 'bg-gray-200 text-gray-700';
    }

    private static formatNumber(num: number): string {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    private static getTimeAgo(dateString: string): string {
        const diff = Date.now() - new Date(dateString).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(dateString).toLocaleDateString();
    }

    private static getRelativeTime(dateString: string): string {
        const diff = Date.now() - new Date(dateString).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
        return new Date(dateString).toLocaleDateString();
    }
}

// ============================================================
// FILTERS CLASS
// ============================================================
// src/types/crm/social-media.types.ts

// ============================================================
// FILTERS CLASS - Make sure it's exported
// ============================================================

export class SocialMediaPostFilters {  // ✅ Must have 'export' keyword
    static filterByStatus(
        posts: SocialMediaPostViewModel[],
        status: PostStatus | null
    ): SocialMediaPostViewModel[] {
        if (!status) return posts;
        return posts.filter(p => p.status === status);
    }

    static filterByPlatform(
        posts: SocialMediaPostViewModel[],
        platform: SocialMediaPlatform | null
    ): SocialMediaPostViewModel[] {
        if (!platform) return posts;
        return posts.filter(p => p.platform === platform);
    }

    static filterByCampaign(
        posts: SocialMediaPostViewModel[],
        campaignId: string | null
    ): SocialMediaPostViewModel[] {
        if (!campaignId) return posts;
        return posts.filter(p => p.campaignId === campaignId);
    }

    static search(posts: SocialMediaPostViewModel[], query: string): SocialMediaPostViewModel[] {
        if (!query) return posts;
        const lowerQuery = query.toLowerCase();
        return posts.filter(p =>
            p.content.toLowerCase().includes(lowerQuery) ||
            p.hashtags.some(h => h.toLowerCase().includes(lowerQuery)) ||
            p.platformDisplay.toLowerCase().includes(lowerQuery)
        );
    }

    static sortByDate(
        posts: SocialMediaPostViewModel[],
        descending: boolean = true
    ): SocialMediaPostViewModel[] {
        return [...posts].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return descending ? dateB - dateA : dateA - dateB;
        });
    }

    static getStatusCounts(posts: SocialMediaPostViewModel[]): Record<PostStatus, number> {
        const counts: Record<PostStatus, number> = {
            [PostStatus.Draft]: 0,
            [PostStatus.Scheduled]: 0,
            [PostStatus.Published]: 0,
            [PostStatus.Failed]: 0,
            [PostStatus.Pending]: 0,
            [PostStatus.Cancelled]: 0,
        };
        posts.forEach(p => {
            counts[p.status] = (counts[p.status] || 0) + 1;
        });
        return counts;
    }
}

// ✅ At the bottom, export everything explicitly


