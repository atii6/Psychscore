import React, { useState, useEffect } from "react";
// import { UserScoreDescriptor, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Edit,
  Save,
  X,
  BarChart3,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyDescriptorsPage() {
  const navigate = useNavigate();
  const [descriptors, setDescriptors] = useState([]);
  const [user, setUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    test_name: "",
    score_type: "standard",
    min_score: "",
    max_score: "",
    descriptor: "",
    percentile_range: "",
    clinical_interpretation: "",
  });

  useEffect(() => {
    loadUserAndDescriptors();
  }, []);

  const loadUserAndDescriptors = async () => {
    const currentUser = await User.me();
    setUser(currentUser);
    const data = await UserScoreDescriptor.filter(
      { created_by: currentUser.email },
      "test_name"
    );
    setDescriptors(data);
  };

  const handleSave = async () => {
    const dataToSave = {
      ...formData,
      min_score: parseFloat(formData.min_score),
      max_score: parseFloat(formData.max_score),
    };

    if (editingId) {
      await UserScoreDescriptor.update(editingId, dataToSave);
    } else {
      await UserScoreDescriptor.create(dataToSave);
    }

    setFormData({
      test_name: "",
      score_type: "standard",
      min_score: "",
      max_score: "",
      descriptor: "",
      percentile_range: "",
      clinical_interpretation: "",
    });
    setIsCreating(false);
    setEditingId(null);
    loadUserAndDescriptors();
  };

  const handleDelete = async (descriptorId) => {
    await UserScoreDescriptor.delete(descriptorId);
    loadUserAndDescriptors();
  };

  const handleEdit = (descriptor) => {
    setFormData({
      test_name: descriptor.test_name,
      score_type: descriptor.score_type,
      min_score: descriptor.min_score.toString(),
      max_score: descriptor.max_score.toString(),
      descriptor: descriptor.descriptor,
      percentile_range: descriptor.percentile_range || "",
      clinical_interpretation: descriptor.clinical_interpretation || "",
    });
    setEditingId(descriptor.id);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setFormData({
      test_name: "",
      score_type: "standard",
      min_score: "",
      max_score: "",
      descriptor: "",
      percentile_range: "",
      clinical_interpretation: "",
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const getScoreTypeColor = (type) => {
    const colors = {
      standard: "bg-blue-100 text-blue-800",
      scaled: "bg-green-100 text-green-800",
      composite: "bg-purple-100 text-purple-800",
      percentile: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Templates"))}
            className="rounded-xl border-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              My Custom Descriptors
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              Create personalized score descriptors and interpretations for your
              practice
            </p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-6 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
            }}
          >
            <Plus className="w-5 h-5" />
            Add Descriptor
          </Button>
        </div>

        {/* Create/Edit Form */}
        {isCreating && (
          <Card
            className="border-0 shadow-lg rounded-2xl mb-6"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "var(--text-primary)" }}>
                {editingId
                  ? "Edit Score Descriptor"
                  : "Add New Score Descriptor"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Test Name
                  </label>
                  <Input
                    value={formData.test_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        test_name: e.target.value,
                      }))
                    }
                    placeholder="e.g., WISC-V, WAIS-IV"
                    className="rounded-lg border-2"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Score Type
                  </label>
                  <select
                    value={formData.score_type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        score_type: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200"
                  >
                    <option value="standard">Standard Score</option>
                    <option value="scaled">Scaled Score</option>
                    <option value="composite">Composite Score</option>
                    <option value="percentile">Percentile</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Min Score
                  </label>
                  <Input
                    type="number"
                    value={formData.min_score}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        min_score: e.target.value,
                      }))
                    }
                    placeholder="70"
                    className="rounded-lg border-2"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Max Score
                  </label>
                  <Input
                    type="number"
                    value={formData.max_score}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        max_score: e.target.value,
                      }))
                    }
                    placeholder="79"
                    className="rounded-lg border-2"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Percentile Range
                  </label>
                  <Input
                    value={formData.percentile_range}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        percentile_range: e.target.value,
                      }))
                    }
                    placeholder="3-8"
                    className="rounded-lg border-2"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Descriptor
                </label>
                <Input
                  value={formData.descriptor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      descriptor: e.target.value,
                    }))
                  }
                  placeholder="e.g., Very Low, Below Average"
                  className="rounded-lg border-2"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Clinical Interpretation (Optional)
                </label>
                <Textarea
                  value={formData.clinical_interpretation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clinical_interpretation: e.target.value,
                    }))
                  }
                  placeholder="Additional clinical notes or interpretation guidance"
                  className="h-24 rounded-lg border-2"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Descriptor
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Descriptors List */}
        <div className="grid gap-4">
          {descriptors.map((descriptor) => (
            <Card
              key={descriptor.id}
              className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "var(--light-blue)" }}
                    >
                      <BarChart3
                        className="w-6 h-6"
                        style={{ color: "var(--secondary-blue)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3
                          className="font-semibold text-lg"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {descriptor.test_name}
                        </h3>
                        <Badge
                          className={getScoreTypeColor(descriptor.score_type)}
                        >
                          {descriptor.score_type}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>
                            Score Range:
                          </span>
                          <p
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {descriptor.min_score} - {descriptor.max_score}
                          </p>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>
                            Descriptor:
                          </span>
                          <p
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {descriptor.descriptor}
                          </p>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)" }}>
                            Percentile:
                          </span>
                          <p
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {descriptor.percentile_range || "N/A"}
                          </p>
                        </div>
                      </div>
                      {descriptor.clinical_interpretation && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {descriptor.clinical_interpretation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(descriptor)}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Descriptor?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this custom
                            descriptor? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(descriptor.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Descriptor
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {descriptors.length === 0 && (
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardContent className="p-12 text-center">
                <BarChart3
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: "var(--text-secondary)" }}
                />
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  No custom descriptors yet
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  Create your personalized score descriptors and interpretations
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
