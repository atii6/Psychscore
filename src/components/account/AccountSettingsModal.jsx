import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { User } from "@/api/entities";
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
  CreditCard,
  Calendar,
  User as UserIcon,
  Crown,
  FileText,
  HardDrive,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  ExternalLink,
  Download,
  HelpCircle,
  Palette,
  Type,
  FileText as HeaderIcon,
  FileImage,
} from "lucide-react";
import { format } from "date-fns";

export default function AccountSettingsModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: "",
    phone: "",
    license_number: "",
    practice_name: "",
  });
  const [reportSettings, setReportSettings] = useState({
    report_table_theme_color: "neutral_gray",
    report_table_show_title: true,
    report_header_content: "",
    report_footer_content: "",
    report_font_family: "Times New Roman",
  });

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    const userData = await User.me();
    setUser(userData);
    setEditData({
      full_name: userData.full_name || "",
      phone: userData.phone || "",
      license_number: userData.license_number || "",
      practice_name: userData.practice_name || "",
    });
    setReportSettings({
      report_table_theme_color:
        userData.report_table_theme_color || "neutral_gray",
      report_table_show_title: userData.report_table_show_title !== false,
      report_header_content: userData.report_header_content || "",
      report_footer_content: userData.report_footer_content || "",
      report_font_family: userData.report_font_family || "Times New Roman",
    });
  };

  const handleSaveProfile = async () => {
    await User.updateMyUserData(editData);
    setUser((prev) => ({ ...prev, ...editData }));
    setIsEditing(false);
  };

  const handleSaveReportSettings = async () => {
    await User.updateMyUserData(reportSettings);
    setUser((prev) => ({ ...prev, ...reportSettings }));
    // Consider adding a success toast notification here
  };

  const subscriptionData = {
    plan: "Professional",
    status: "Active",
    cost: "$49",
    billing_period: "monthly",
    next_billing_date: "2025-02-15",
    assessments_this_month: 12,
    assessment_limit: 100,
    storage_used: "2.4 GB",
    storage_limit: "10 GB",
  };

  const billingHistory = [
    {
      date: "2025-01-15",
      amount: "$49.00",
      status: "Paid",
      invoice: "INV-2025-001",
    },
    {
      date: "2024-12-15",
      amount: "$49.00",
      status: "Paid",
      invoice: "INV-2024-012",
    },
    {
      date: "2024-11-15",
      amount: "$49.00",
      status: "Paid",
      invoice: "INV-2024-011",
    },
  ];

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

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  if (!user) return null;

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
                      <p className="font-medium">{user.full_name}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-500">Email Address</Label>
                    <p className="font-medium">{user.email}</p>
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
                      <p className="font-medium">{user.phone || "Not set"}</p>
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
                        {user.license_number || "Not set"}
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
                        {user.practice_name || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-500">Member Since</Label>
                    <p className="font-medium">
                      {format(new Date(user.created_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Subscription Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-start p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <Badge className="bg-blue-600 text-white">
                      {subscriptionData.plan}
                    </Badge>
                    <p className="text-3xl font-bold mt-2">
                      {subscriptionData.cost}
                      <span className="text-lg font-normal text-gray-600">
                        /month
                      </span>
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      Status: {subscriptionData.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Next billing date:</p>
                    <p className="font-medium">
                      {format(
                        new Date(subscriptionData.next_billing_date),
                        "MMMM d, yyyy"
                      )}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        Cancel Subscription
                      </Button>
                      <Button size="sm">Upgrade Plan</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Billing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left font-medium">Date</th>
                        <th className="p-3 text-left font-medium">Amount</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.map((item) => (
                        <tr key={item.invoice} className="border-t">
                          <td className="p-3">{item.date}</td>
                          <td className="p-3">{item.amount}</td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className="text-green-700 bg-green-50 border-green-200"
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> {item.invoice}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-purple-600" />
                  Current Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="font-medium">Assessments This Month</span>
                    <span className="text-gray-500">
                      {subscriptionData.assessments_this_month} /{" "}
                      {subscriptionData.assessment_limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${
                          (subscriptionData.assessments_this_month /
                            subscriptionData.assessment_limit) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="font-medium">Storage Used</span>
                    <span className="text-gray-500">
                      {subscriptionData.storage_used} /{" "}
                      {subscriptionData.storage_limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: "24%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report_customization" className="space-y-6">
            {/* Font Selection */}
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
                    <Type
                      className="w-5 h-5"
                      style={{ color: "var(--secondary-blue)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Font Settings
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Choose the default font for your reports
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label
                      className="text-sm font-medium mb-3 block"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Report Font Family
                    </Label>
                    <Select
                      value={reportSettings.report_font_family}
                      onValueChange={(value) =>
                        setReportSettings((prev) => ({
                          ...prev,
                          report_font_family: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Times New Roman">
                          Times New Roman (Traditional)
                        </SelectItem>
                        <SelectItem value="Arial">
                          Arial (Sans-serif)
                        </SelectItem>
                        <SelectItem value="Calibri">
                          Calibri (Modern)
                        </SelectItem>
                        <SelectItem value="Georgia">
                          Georgia (Elegant)
                        </SelectItem>
                        <SelectItem value="Verdana">Verdana (Clean)</SelectItem>
                      </SelectContent>
                    </Select>
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
                      Save Font Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(colorThemes).map(([key, theme]) => (
                        <div
                          key={key}
                          onClick={() =>
                            setReportSettings((prev) => ({
                              ...prev,
                              report_table_theme_color: key,
                            }))
                          }
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            reportSettings.report_table_theme_color === key
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div
                            className="w-full h-8 rounded-lg mb-2"
                            style={{
                              backgroundColor: theme.preview,
                              border: `1px solid ${theme.border}`,
                            }}
                          />
                          <p
                            className="text-sm font-medium text-center"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {theme.name}
                          </p>
                        </div>
                      ))}
                    </div>
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
                    <div className="flex items-center gap-3">
                      <Switch
                        id="show-titles"
                        checked={reportSettings.report_table_show_title}
                        onCheckedChange={(checked) =>
                          setReportSettings((prev) => ({
                            ...prev,
                            report_table_show_title: checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="show-titles"
                        className={`font-medium transition-colors duration-200 ${
                          reportSettings.report_table_show_title
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      >
                        {reportSettings.report_table_show_title ? "On" : "Off"}
                      </Label>
                    </div>
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
                  <div>
                    <Label
                      className="text-sm font-medium mb-3 block"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Report Header
                    </Label>
                    <div className="border rounded-lg">
                      <ReactQuill
                        value={reportSettings.report_header_content}
                        onChange={(value) =>
                          setReportSettings((prev) => ({
                            ...prev,
                            report_header_content: value,
                          }))
                        }
                        modules={quillModules}
                        placeholder="Enter your report header (e.g., practice name, logo, contact info)..."
                        className="header-editor"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      className="text-sm font-medium mb-3 block"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Report Footer
                    </Label>
                    <div className="border rounded-lg">
                      <ReactQuill
                        value={reportSettings.report_footer_content}
                        onChange={(value) =>
                          setReportSettings((prev) => ({
                            ...prev,
                            report_footer_content: value,
                          }))
                        }
                        modules={quillModules}
                        placeholder="Enter your report footer (e.g., confidentiality notice, contact info)..."
                        className="footer-editor"
                      />
                    </div>
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
                      Save Header & Footer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="px-6">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>

      <style jsx global>{`
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
