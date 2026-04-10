export interface GuideCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface GuideTopic {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  tags: string[];
}
