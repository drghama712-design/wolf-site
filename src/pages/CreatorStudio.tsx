import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Upload, Play, Download, Zap, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CreatorStudio() {
  const { user, isAuthenticated } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: subscription } = trpc.video.getSubscriptionStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: jobs } = trpc.video.listJobs.useQuery({}, {
    enabled: isAuthenticated,
  });

  const uploadMutation = trpc.video.uploadVideo.useMutation({
    onSuccess: () => {
      toast.success("Video uploaded successfully!");
      setSelectedFile(null);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error("File size must be less than 500MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const buffer = await selectedFile.arrayBuffer();
      await uploadMutation.mutateAsync({
        fileName: selectedFile.name,
        fileBuffer: buffer,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to FORTRESS SPLITTER</CardTitle>
            <CardDescription>Sign in to start creating amazing video content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please sign in to access the Creator Studio and start processing your videos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Creator Studio</h1>
          <p className="text-slate-400">Welcome back, {user?.name || "Creator"}!</p>
        </div>

        {/* Subscription Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-300">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {subscription?.tier === "pro" ? "PRO" : "FREE"}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {subscription?.tier === "pro"
                  ? "Unlimited splits with high-bitrate"
                  : "1 split per month (trial)"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-300">Credits Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(subscription?.creditsRemaining || 0) > 0 ? "Available" : "Used"}
              </div>
              <Progress value={subscription?.tier === "pro" ? 100 : 50} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-300">Videos Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{jobs?.length || 0}</div>
              <p className="text-xs text-slate-400 mt-1">Total segments created</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Upload New Video</CardTitle>
                <CardDescription>
                  Select a video file to start the intelligent splitting process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subscription Warning */}
                {subscription?.tier === "free" && subscription?.creditsRemaining <= 0 && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-200">Monthly limit reached</p>
                      <p className="text-sm text-yellow-300">
                        You've used your monthly free split. Upgrade to PRO for unlimited processing.
                      </p>
                    </div>
                  </div>
                )}

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <p className="text-lg font-medium text-white mb-1">
                      {selectedFile ? selectedFile.name : "Drop your video here"}
                    </p>
                    <p className="text-sm text-slate-400">
                      or click to select (Max 500MB)
                    </p>
                  </label>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Uploading...</span>
                      <span className="text-slate-400">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={
                    !selectedFile ||
                    uploadMutation.isPending ||
                    (subscription?.tier === "free" && subscription?.creditsRemaining <= 0)
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {uploadMutation.isPending ? "Processing..." : "Start Processing"}
                </Button>

                {/* Processing Settings */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Silence Threshold</label>
                    <input
                      type="range"
                      min="-40"
                      max="-10"
                      defaultValue="-30"
                      className="w-full mt-2"
                    />
                    <p className="text-xs text-slate-400 mt-1">-30 dB</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Scene Sensitivity</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.1"
                      defaultValue="0.5"
                      className="w-full mt-2"
                    />
                    <p className="text-xs text-slate-400 mt-1">0.5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Processing Tab */}
          <TabsContent value="processing" className="space-y-4">
            {jobs && jobs.length > 0 ? (
              <div className="grid gap-4">
                {jobs
                  .filter((job: any) => job.status === "processing")
                  .map((job: any) => (
                    <Card key={job.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-white">{job.filename}</h3>
                            <p className="text-sm text-slate-400">
                              <Clock className="w-4 h-4 inline mr-1" />
                              Started {new Date(job.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm">
                            Processing
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Progress</span>
                            <span className="text-slate-400">{job.progress || 0}%</span>
                          </div>
                          <Progress value={job.progress || 0} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6 text-center">
                  <p className="text-slate-400">No videos currently processing</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {jobs && jobs.length > 0 ? (
              <div className="grid gap-4">
                {jobs
                  .filter((job: any) => job.status === "completed")
                  .map((job: any) => (
                    <Card key={job.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{job.filename}</h3>
                            <p className="text-sm text-slate-400 mt-1">
                              {job.segmentCount} segments • {job.outputFormat}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Completed {new Date(job.updatedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Play className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6 text-center">
                  <p className="text-slate-400">No completed videos yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Upgrade CTA */}
            {subscription?.tier === "free" && subscription?.creditsRemaining <= 0 && (
          <Card className="bg-gradient-to-r from-blue-900 to-blue-800 border-blue-700 mt-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Upgrade to PRO</h3>
                  <p className="text-blue-200 text-sm mt-1">
                    Unlimited video processing with high-bitrate output and no watermarks
                  </p>
                </div>
                <Button className="bg-white text-blue-900 hover:bg-blue-50">
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
