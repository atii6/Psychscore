import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  User as UserIcon,
  Edit,
  Save,
  X,
  HelpCircle,
  Palette,
  Type,
  FileText as HeaderIcon,
  LogOut,
} from "lucide-react";
import { format } from "date-fns";
import useUpdateUser from "@/hooks/users/useUpdateUser";
import type {
  ReportFontFamily,
  ReportTableThemeColor,
  UserRole,
} from "@/utilitites/types/User";
import useLogout from "@/hooks/auth/useLogout";
import useUserStore from "@/store/userStore";
import useGetUserByID from "@/hooks/users/useGetUserById";
import SubscriptionCard from "./SubscriptionCard";
import BillingHistoryCard from "./BillingHistoryCard";
import UsageCard from "./UsageCard";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import FontSettingsForm from "./FontSettingsForm";
import LabeledSwitch from "./LabeledSwitch";
import ColorThemeSelector from "./ColorThemeSelector";
import RichTextEditorCard from "./RichTextEditorCard";

type AccountSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AccountSettingsModal({
  isOpen,
  onClose,
}: AccountSettingsModalProps) {
  const user = useUserStore(React.useCallback((state) => state.user, []));
  const { data: userByID, isLoading } = useGetUserByID(user?.id || 0);
  const { mutateAsync: updateUser } = useUpdateUser();
  const { mutateAsync: logout } = useLogout();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({
    full_name: "",
    phone: "",
    license_number: "",
    practice_name: "",
  });
  const [reportSettings, setReportSettings] = React.useState({
    report_table_theme_color: "neutral_gray",
    report_table_show_title: true,
    report_header_content: "",
    report_footer_content: "",
    report_font_family: "Times New Roman",
  });

  React.useMemo(() => {
    if (userByID) {
      setEditData({
        full_name: userByID.full_name || "",
        phone: userByID.phone || "",
        license_number: userByID.license_number || "",
        practice_name: userByID.practice_name || "",
      });

      setReportSettings({
        report_table_theme_color:
          userByID.report_table_theme_color || "neutral_gray",
        report_table_show_title: userByID.report_table_show_title ?? true,
        report_header_content: userByID.report_header_content || "",
        report_footer_content: userByID.report_footer_content || "",
        report_font_family: userByID.report_font_family || "Times New Roman",
      });
    }
  }, [userByID]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSaveProfile = async () => {
    const userData = {
      ...user,
      ...editData,
      id: user?.id || 0,
      role: user?.role as UserRole,
      email: user?.email || "",
    };
    await updateUser(
      {
        id: user?.id || 0,
        userData,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["users", user?.id],
          });
          toast.success("User info updated.");
        },
      }
    );
    setIsEditing(false);
  };

  const handleSaveReportSettings = async () => {
    if (user) {
      const userData = {
        ...user,
        ...reportSettings,
        report_table_theme_color:
          reportSettings.report_table_theme_color as ReportTableThemeColor,
        report_font_family:
          reportSettings.report_font_family as ReportFontFamily,
      };
      await updateUser(
        {
          id: user?.id || 0,
          userData,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["users", user.id],
            });
            toast.success("Settings updated.");
          },
        }
      );
    }
  };

  const colorThemes = {
    neutral_gray: {
      name: "Neutral Gray",
      preview: "#f3f4f6",
      border: "#e5e7eb",
    },
    light_blue: { name: "Light Blue", preview: "#dbeafe", border: "#93c5fd" },
    soft_orange: { name: "Soft Orange", preview: "#fed7aa", border: "#fb923c" },
    mint_green: { name: "Mint Green", preview: "#bbf7d0", border: "#4ade80" },
  };

  if (!userByID || isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: "var(--text-primary)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
              }}
            >
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            Account Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="profile" className="rounded-lg">
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-lg">
              Subscription
            </TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg">
              Billing
            </TabsTrigger>
            <TabsTrigger value="usage" className="rounded-lg">
              Usage
            </TabsTrigger>
            <TabsTrigger value="report_customization" className="rounded-lg">
              Report Customization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  My Profile
                </CardTitle>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <Label className="text-gray-500">Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={editData.full_name}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            full_name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-medium">{userByID.full_name}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-500">Email Address</Label>
                    <p className="font-medium">{userByID.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-medium">
                        {userByID.phone || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-500">License Number</Label>
                    {isEditing ? (
                      <Input
                        value={editData.license_number}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            license_number: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-medium">
                        {userByID.license_number || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-500">Practice Name</Label>
                    {isEditing ? (
                      <Input
                        value={editData.practice_name}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            practice_name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-medium">
                        {userByID.practice_name || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-500">Member Since</Label>
                    <p className="font-medium">
                      {format(
                        new Date(userByID.created_date || ""),
                        "MMMM d, yyyy"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <SubscriptionCard />
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <BillingHistoryCard />
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <UsageCard />
          </TabsContent>

          <TabsContent value="report_customization" className="space-y-6">
            {/* Font Selection */}
            <FontSettingsForm userData={userByID} />

            {/* Table Customization */}
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardHeader
                className="pb-4"
                style={{ borderBottom: "2px solid var(--light-blue)" }}
              >
                <CardTitle className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "var(--light-blue)" }}
                  >
                    <Palette
                      className="w-5 h-5"
                      style={{ color: "var(--secondary-blue)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Table Customization
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Customize the appearance of score tables
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <Label
                      className="text-sm font-medium mb-3 block"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Table Color Theme
                    </Label>
                    <ColorThemeSelector
                      themes={colorThemes}
                      selected={reportSettings.report_table_theme_color}
                      onSelect={(key) =>
                        setReportSettings((prev) => ({
                          ...prev,
                          report_table_theme_color:
                            key as ReportTableThemeColor,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Label
                        htmlFor="show-titles"
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Show Table Titles
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="p-4 max-w-sm bg-white shadow-lg rounded-lg border"
                          >
                            <div className="space-y-2">
                              <p className="font-semibold text-base text-gray-800">
                                Example with Title
                              </p>
                              <p className="text-sm text-gray-600">
                                When enabled, a title will appear above your
                                score tables like this:
                              </p>
                              <div className="text-sm mt-2 p-3 bg-gray-50 rounded-md border">
                                <table className="w-full border-collapse">
                                  <caption
                                    className="text-center font-bold mb-2 text-base"
                                    style={{ color: "black" }}
                                  >
                                    WAIS-V Scores
                                  </caption>
                                  <thead>
                                    <tr className="bg-gray-200">
                                      <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                                        Subtest/Index
                                      </th>
                                      <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                                        Score
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="border border-gray-300 px-2 py-1 font-bold">
                                        Full Scale IQ (FSIQ)
                                      </td>
                                      <td className="border border-gray-300 px-2 py-1 text-center">
                                        105
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="border border-gray-300 px-2 py-1 pl-4">
                                        Similarities
                                      </td>
                                      <td className="border border-gray-300 px-2 py-1 text-center">
                                        12
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <LabeledSwitch
                      label={
                        reportSettings.report_table_show_title ? "On" : "Off"
                      }
                      checked={reportSettings.report_table_show_title}
                      onChange={(checked) =>
                        setReportSettings((prev) => ({
                          ...prev,
                          report_table_show_title: checked,
                        }))
                      }
                      labelStyle={
                        reportSettings.report_table_show_title
                          ? "text-blue-600"
                          : "text-gray-500"
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveReportSettings}
                      className="text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Table Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Header/Footer Customization */}
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardHeader
                className="pb-4"
                style={{ borderBottom: "2px solid var(--light-blue)" }}
              >
                <CardTitle className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "var(--light-blue)" }}
                  >
                    <HeaderIcon
                      className="w-5 h-5"
                      style={{ color: "var(--secondary-blue)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Header & Footer
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Add custom headers and footers to all reports
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <RichTextEditorCard
                    label="Report Header"
                    value={reportSettings.report_header_content}
                    onChange={(value) =>
                      setReportSettings((prev) => ({
                        ...prev,
                        report_header_content: value,
                      }))
                    }
                    classname="header-editor"
                    placeholder="Enter your report header (e.g., practice name, logo, contact info)..."
                  />

                  <RichTextEditorCard
                    label="Report Footer"
                    value={reportSettings.report_footer_content}
                    onChange={(value) =>
                      setReportSettings((prev) => ({
                        ...prev,
                        report_footer_content: value,
                      }))
                    }
                    classname="footer-editor"
                    placeholder="Enter your report footer (e.g., confidentiality notice, contact info)..."
                  />

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveReportSettings}
                      className="text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Header & Footer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="px-6">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button variant="outline" onClick={handleLogout} className="px-6">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </DialogContent>

      <style>{`
        .header-editor .ql-editor,
        .footer-editor .ql-editor {
          min-height: 120px;
          font-size: 14px;
        }
        .header-editor .ql-container,
        .footer-editor .ql-container {
          border-bottom: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .header-editor .ql-toolbar,
        .footer-editor .ql-toolbar {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-radius: 0.5rem 0.5rem 0 0;
        }
      `}</style>
    </Dialog>
  );
}
