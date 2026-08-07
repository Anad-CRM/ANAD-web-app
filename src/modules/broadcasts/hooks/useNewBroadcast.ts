"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { getTemplates, createBroadcast, sendBroadcast } from "@/core/api/broadcastApi";
import {
  getTemplateMessages,
  createTemplateMessage,
  deleteTemplateMessage,
} from "@/core/api/templateApi";
import type { MetaTemplate } from "@/core/api/broadcastApi";
import type { TemplateMessage } from "@/core/api/templateApi";
import type { TemplateSource } from "@/modules/broadcasts/types/broadcast.types";

export interface UseNewBroadcastReturn {
  // Navigation
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  handleNext: () => void;
  handleBack: () => void;

  // Template data
  metaTemplates: MetaTemplate[];
  customTemplates: TemplateMessage[];
  loadingTemplates: boolean;
  selectedTemplate: TemplateSource | null;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<TemplateSource | null>>;

  // Custom template CRUD
  addCustomTemplate: (title: string, message: string) => Promise<void>;
  deleteCustomTemplate: (id: string) => Promise<void>;
  addingCustomTemplate: boolean;

  // Form state
  campaignName: string;
  setCampaignName: React.Dispatch<React.SetStateAction<string>>;
  audienceType: string;
  setAudienceType: React.Dispatch<React.SetStateAction<string>>;
  selectedLeadIds: string[];
  setSelectedLeadIds: React.Dispatch<React.SetStateAction<string[]>>;

  // Variables & Media Header
  headerMediaUrl: string;
  setHeaderMediaUrl: React.Dispatch<React.SetStateAction<string>>;
  headerVariables: Record<string, string>;
  handleHeaderVariableChange: (key: string, val: string) => void;
  bodyVariables: Record<string, string>;
  handleVariableChange: (key: string, val: string) => void;
  sendImmediately: boolean;
  setSendImmediately: React.Dispatch<React.SetStateAction<boolean>>;

  // Derived
  bodyText: string;
  headerText: string;
  headerFormat: string | null;
  headerPlaceholders: string[];
  placeholders: string[];
  previewHeader: string;
  previewText: string;

  // Actions
  submitting: boolean;
  handleSubmit: () => Promise<void>;
}

/**
 * Encapsulates all state and business logic for the New Broadcast Modal/Page.
 * Loads Meta-approved templates & local custom templates.
 */
export function useNewBroadcast(
  open: boolean,
  onCreated: () => void
): UseNewBroadcastReturn {
  const [step, setStep] = useState(1);
  const [metaTemplates, setMetaTemplates] = useState<MetaTemplate[]>([]);
  const [customTemplates, setCustomTemplates] = useState<TemplateMessage[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [addingCustomTemplate, setAddingCustomTemplate] = useState(false);

  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSource | null>(null);
  const [audienceType, setAudienceType] = useState("all");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [headerMediaUrl, setHeaderMediaUrl] = useState("");
  const [headerVariables, setHeaderVariables] = useState<Record<string, string>>({});
  const [bodyVariables, setBodyVariables] = useState<Record<string, string>>({});
  const [sendImmediately, setSendImmediately] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Reset + fetch templates when opened
  useEffect(() => {
    if (!open) return;

    setStep(1);
    setCampaignName("");
    setSelectedTemplate(null);
    setAudienceType("all");
    setSelectedLeadIds([]);
    setHeaderMediaUrl("");
    setHeaderVariables({});
    setBodyVariables({});
    setSendImmediately(true);

    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const [metaResult, customResult] = await Promise.allSettled([
          getTemplates(),
          getTemplateMessages(),
        ]);

        if (metaResult.status === "fulfilled") {
          setMetaTemplates(metaResult.value);
        } else {
          console.warn("Meta templates unavailable:", metaResult.reason);
          setMetaTemplates([]);
        }

        if (customResult.status === "fulfilled") {
          setCustomTemplates(customResult.value.filter((t) => t.isActive));
        } else {
          console.warn("Custom templates unavailable:", customResult.reason);
          setCustomTemplates([]);
        }
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [open]);

  /** Add a new custom template */
  const addCustomTemplate = useCallback(async (title: string, message: string) => {
    setAddingCustomTemplate(true);
    try {
      const created = await createTemplateMessage(title, message);
      setCustomTemplates((prev) => [created, ...prev]);
      toast.success("Template created!");
    } catch {
      toast.error("Failed to create template");
    } finally {
      setAddingCustomTemplate(false);
    }
  }, []);

  /** Delete a custom template */
  const deleteCustomTemplate = useCallback(async (id: string) => {
    try {
      await deleteTemplateMessage(id);
      setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
      setSelectedTemplate((prev) => {
        if (prev?.source === "custom" && prev.id === id) return null;
        return prev;
      });
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    }
  }, []);

  // Header component info
  const headerComponent = useMemo(() => {
    if (selectedTemplate?.source === "meta") {
      return selectedTemplate.components.find((c) => c.type === "HEADER") ?? null;
    }
    return null;
  }, [selectedTemplate]);

  const headerText = headerComponent?.text ?? "";
  const headerFormat = headerComponent?.format ?? null;

  const headerPlaceholders = useMemo(() => {
    if (!headerText) return [];
    const matches = headerText.match(/\{\{(\d+)\}\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches)).sort(
      (a, b) => parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""))
    );
  }, [headerText]);

  // Body text from selected template
  const bodyText = useMemo(() => {
    if (!selectedTemplate) return "";
    if (selectedTemplate.source === "meta") {
      return selectedTemplate.components.find((c) => c.type === "BODY")?.text ?? "";
    }
    return selectedTemplate.body;
  }, [selectedTemplate]);

  // Body placeholders
  const placeholders = useMemo(() => {
    const matches = bodyText.match(/\{\{(\d+)\}\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches)).sort((a, b) => {
      return parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""));
    });
  }, [bodyText]);

  // Preview header text
  const previewHeader = useMemo(() => {
    let text = headerText;
    headerPlaceholders.forEach((ph) => {
      const num = ph.replace(/\D/g, "");
      text = text.replaceAll(ph, headerVariables[num] || ph);
    });
    return text;
  }, [headerText, headerPlaceholders, headerVariables]);

  // Preview body text
  const previewText = useMemo(() => {
    let text = bodyText;
    placeholders.forEach((ph) => {
      const num = ph.replace(/\D/g, "");
      text = text.replaceAll(ph, bodyVariables[num] || ph);
    });
    return text;
  }, [bodyText, placeholders, bodyVariables]);

  const handleHeaderVariableChange = (key: string, val: string) => {
    setHeaderVariables((prev) => ({ ...prev, [key]: val }));
  };

  const handleVariableChange = (key: string, val: string) => {
    setBodyVariables((prev) => ({ ...prev, [key]: val }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!campaignName.trim()) {
        toast.error("Please enter a campaign name");
        return;
      }
      if (!selectedTemplate) {
        toast.error("Please select a message template");
        return;
      }
      if (loadingTemplates) {
        toast.error("Please wait for templates to finish loading");
        return;
      }
    }
    if (step === 2) {
      if (audienceType === "selected" && selectedLeadIds.length === 0) {
        toast.error("Please select at least one recipient lead");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }
    if (selectedTemplate.source === "custom") {
      toast.error(
        "Custom templates cannot be used for broadcast — please select a Meta-approved WhatsApp template."
      );
      return;
    }

    // Check header variables
    const missingHeaderVars = headerPlaceholders.some((ph) => {
      const num = ph.replace(/\D/g, "");
      return !headerVariables[num]?.trim();
    });
    if (missingHeaderVars) {
      toast.error("Please fill out all header template variables");
      return;
    }

    // Check media header URL if required
    const isMediaHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat || "");
    if (isMediaHeader && !headerMediaUrl.trim()) {
      toast.error(`Please provide a ${headerFormat} URL for the template header`);
      return;
    }

    // Check body variables
    const missingBodyVars = placeholders.some((ph) => {
      const num = ph.replace(/\D/g, "");
      return !bodyVariables[num]?.trim();
    });
    if (missingBodyVars) {
      toast.error("Please fill out all body template variables");
      return;
    }

    setSubmitting(true);
    try {
      const templateParams: any[] = [];

      // Add header component parameter if needed
      if (headerFormat === "TEXT" && headerPlaceholders.length > 0) {
        templateParams.push({
          type: "header",
          parameters: headerPlaceholders.map((ph) => ({
            type: "text",
            text: headerVariables[ph.replace(/\D/g, "")] || "",
          })),
        });
      } else if (isMediaHeader && headerMediaUrl.trim()) {
        const mediaType = (headerFormat || "IMAGE").toLowerCase();
        templateParams.push({
          type: "header",
          parameters: [
            {
              type: mediaType,
              [mediaType]: { link: headerMediaUrl.trim() },
            },
          ],
        });
      }

      // Add body component parameters if needed
      if (placeholders.length > 0) {
        templateParams.push({
          type: "body",
          parameters: placeholders.map((ph) => ({
            type: "text",
            text: bodyVariables[ph.replace(/\D/g, "")] || "",
          })),
        });
      }

      const createPayload = {
        campaignName: campaignName.trim(),
        templateName: selectedTemplate.name,
        templateLanguage: selectedTemplate.language,
        templateParams,
        ...(selectedLeadIds.length > 0
          ? { leadIds: selectedLeadIds }
          : { filterByStatus: audienceType }),
      };

      const res = await createBroadcast(createPayload);
      toast.success("Broadcast campaign created successfully!");

      if (sendImmediately && res?.broadcastId) {
        await sendBroadcast(res.broadcastId);
        toast.success("Broadcast campaign execution started!");
      }

      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create broadcast");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    handleNext,
    handleBack,
    metaTemplates,
    customTemplates,
    loadingTemplates,
    selectedTemplate,
    setSelectedTemplate,
    addCustomTemplate,
    deleteCustomTemplate,
    addingCustomTemplate,
    campaignName,
    setCampaignName,
    audienceType,
    setAudienceType,
    selectedLeadIds,
    setSelectedLeadIds,
    headerMediaUrl,
    setHeaderMediaUrl,
    headerVariables,
    handleHeaderVariableChange,
    bodyVariables,
    handleVariableChange,
    sendImmediately,
    setSendImmediately,
    bodyText,
    headerText,
    headerFormat,
    headerPlaceholders,
    placeholders,
    previewHeader,
    previewText,
    submitting,
    handleSubmit,
  };
}
