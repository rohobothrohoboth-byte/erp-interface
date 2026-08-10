import type { Lead } from "@/modules/crm/types/crm";

interface RoutingRule {
  id: string;
  name: string;
  description: string;
  conditions: RoutingCondition[];
  assignTo: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface RoutingCondition {
  field: string;
  operator: string;
  value: string;
}

export class RoutingService {
  private static getRoutingRules(): RoutingRule[] {
    const stored = localStorage.getItem("routingRules");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Error parsing routing rules:", error);
      }
    }
    return [];
  }

  private static evaluateCondition(
    lead: Partial<Lead>,
    condition: RoutingCondition,
  ): boolean {
    const fieldValue = this.getFieldValue(lead, condition.field);
    const conditionValue = condition.value.toLowerCase();

    if (fieldValue === null || fieldValue === undefined) {
      return false;
    }

    const leadValue = String(fieldValue).toLowerCase();

    switch (condition.operator) {
      case "equals":
        return leadValue === conditionValue;
      case "contains":
        return leadValue.includes(conditionValue);
      case "starts_with":
        return leadValue.startsWith(conditionValue);
      case "ends_with":
        return leadValue.endsWith(conditionValue);
      case "greater_than":
        const numValue = parseFloat(leadValue);
        const numCondition = parseFloat(conditionValue);
        return (
          !isNaN(numValue) && !isNaN(numCondition) && numValue > numCondition
        );
      case "less_than":
        const numValue2 = parseFloat(leadValue);
        const numCondition2 = parseFloat(conditionValue);
        return (
          !isNaN(numValue2) &&
          !isNaN(numCondition2) &&
          numValue2 < numCondition2
        );
      default:
        return false;
    }
  }

  private static getFieldValue(lead: Partial<Lead>, field: string): any {
    switch (field) {
      case "source":
        return lead.source;
      case "industry":
        return lead.industry;
      case "budget":
        return lead.budget;
      case "score":
        return lead.score;
      case "company":
        return lead.company;
      case "location":
        return lead.city || lead.state || lead.country;
      default:
        return null;
    }
  }

  private static evaluateRule(lead: Partial<Lead>, rule: RoutingRule): boolean {
    // All conditions must be true for the rule to match
    return rule.conditions.every((condition) =>
      this.evaluateCondition(lead, condition),
    );
  }

  public static assignLeadToSalesRep(lead: Partial<Lead>): string | null {
    const rules = this.getRoutingRules()
      .filter((rule) => rule.isActive)
      .sort((a, b) => a.priority - b.priority); // Sort by priority (lower number = higher priority)

    // Find the first matching rule
    for (const rule of rules) {
      if (this.evaluateRule(lead, rule)) {
        console.log(`Lead assigned to ${rule.assignTo} via rule: ${rule.name}`);
        return rule.assignTo;
      }
    }

    // No matching rule found
    console.log("No matching routing rule found for lead");
    return null;
  }

  public static getMatchingRules(lead: Partial<Lead>): RoutingRule[] {
    const rules = this.getRoutingRules()
      .filter((rule) => rule.isActive)
      .sort((a, b) => a.priority - b.priority);

    return rules.filter((rule) => this.evaluateRule(lead, rule));
  }

  public static testRule(rule: RoutingRule, lead: Partial<Lead>): boolean {
    return this.evaluateRule(lead, rule);
  }
}

export default RoutingService;
