"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getTemplates, createBroadcast, sendBroadcast } from "@/core/api/broadcastApi";
import type { MetaTemplate } from "@/core/api/broadcastApi";

export interface UseNewBroadcastReturn {
  // Navigation
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  handleNext: () => void;
  handleBack: () => void;

  // Data
  templates: MetaTemplate[];
  loadingTemplates: boolean;

  // Form state
  campaignName: string;
  setCampaignName: React.Dispatch<React.SetStateAction<string>>;
  selectedTemplate: MetaTemplate | null;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<MetaTemplate | null>>;
  audienceType: string;
  setAudienceType: React.Dispatch<React.SetStateAction<string>>;
  bodyVariables: Record<string, string>;
  handleVariableChange: (key: string, val: string) => void;
  sendImmediately: boolean;
  setSendImmediately: React.Dispatch<React.SetStateAction<boolean>>;

  // Derived
  bodyText: string;
  placeholders: string[];
  previewText: string;

  // Actions
  submitting: boolean;
  handleSubmit: () => Promise<void>;
}

/**
 * Encapsulates all state and business logic for the New Broadcast Modal.
 * The `open` prop drives reset + template fetch on mount.
 */
export function useNewBroadcast(
  open: boolean,
  onCreated: () => void
): UseNewBroadcastReturn {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<MetaTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<MetaTemplate | null>(null);
  const [audienceType, setAudienceType] = useState("all");
  const [bodyVariables, setBodyVariables] = useState<Record<string, string>>({});
  const [sendImmediately, setSendImmediately] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Reset + fetch templates when modal opens
  useEffect(() => {
    if (!open) return;

    setStep(1);
    setCampaignName("");
    setSelectedTemplate(null);
    setAudienceType("all");
    setBodyVariables({});
    setSendImmediately(true);

    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const tpls = await getTemplates();
        setTemplates(tpls);
      } catch {
        toast.error("Failed to fetch WhatsApp templates");
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [open]);

  // Derived: body text from selected template
  const bodyText = useMemo(() => {
    if (!selectedTemplate) return "";
    return selectedTemplate.components.find((c) => c.type === "BODY")?.text ?? "";
  }, [selectedTemplate]);

  // Derived: sorted unique placeholders like {{1}}, {{2}}
  const placeholders = useMemo(() => {
    const matches = bodyText.match(/\{\{(\d+)\}\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches)).sort((a, b) => {
      return parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""));
    });
  }, [bodyText]);

  // Derived: message body with variables substituted for preview
  const previewText = useMemo(() => {
    let text = bodyText;
    placeholders.forEach((ph) => {
      const num = ph.replace(/\D/g, "");
      text = text.replaceAll(ph, bodyVariables[num] || ph);
    });
    return text;
  }, [bodyText, placeholders, bodyVariables]);

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

    const missingVariables = placeholders.some((ph) => {
      const num = ph.replace(/\D/g, "");
      return !bodyVariables[num]?.trim();
    });

    if (missingVariables) {
      toast.error("Please fill out all template variables");
      return;
    }

    setSubmitting(true);
    try {
      const templateParams =
        placeholders.length > 0
          ? [
              {
                type: "body",
                parameters: placeholders.map((ph) => ({
                  type: "text",
                  text: bodyVariables[ph.replace(/\D/g, "")] || "",
                })),
              },
            ]
          : [];

      const res = await createBroadcast({
        campaignName: campaignName.trim(),
        templateName: selectedTemplate.name,
        templateLanguage: selectedTemplate.language,
        templateParams,
        filterByStatus: audienceType,
      });

      toast.success("Broadcast campaign created successfully!");

      if (sendImmediately && res?.broadcastId) {
        await sendBroadcast(res.broadcastId);
        toast.success("Broadcast sending started!");
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
    templates,
    loadingTemplates,
    campaignName,
    setCampaignName,
    selectedTemplate,
    setSelectedTemplate,
    audienceType,
    setAudienceType,
    bodyVariables,
    handleVariableChange,
    sendImmediately,
    setSendImmediately,
    bodyText,
    placeholders,
    previewText,
    submitting,
    handleSubmit,
  };
}
