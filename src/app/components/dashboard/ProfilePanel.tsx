import { useState, useRef, useEffect } from "react";
import { User, Mail, Shield, Calendar, Edit, Save, Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AvatarImage } from "../ui/avatar";
import { useAuth } from "../../context/AuthContext";
import { getToken } from "../../services/api";
import { toast } from "sonner";

// Use Vite proxy to avoid CORS issues
// Proxy is configured in vite.config.ts to forward /api to http://192.168.100.68:4000
const API_BASE_URL = '/api';

export function ProfilePanel() {
  const { user, permissions, isSuperAdmin, refreshUser } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    (user as any)?.avatar || (user as any)?.profileImage || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [originalEmail, setOriginalEmail] = useState(user?.email || "");

  // Sync formData and avatarUrl when user changes
  useEffect(() => {
    if (user) {
      // Update avatarUrl if user avatar changes
      const userAvatar = (user as any)?.avatar || (user as any)?.profileImage || null;
      if (userAvatar !== avatarUrl) {
        setAvatarUrl(userAvatar);
      }
      
      // Update originalEmail if changed
      if (user.email && user.email !== originalEmail) {
        setOriginalEmail(user.email);
      }
    }
    // Only depend on user, not on avatarUrl or originalEmail to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-slate-900 mb-1">Profile</h1>
          <p className="text-slate-600">User information not available</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditClick = () => {
    if (user) {
      const currentEmail = user.email || "";
      setOriginalEmail(currentEmail);
      setFormData({
        name: user.name,
        email: currentEmail,
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      // Call update profile API
      // Backend endpoint: PUT /admin/users/:id/profile
      let response;
      let data;
      
      // Build update payload according to API spec
      // API expects: { name, email, avatar?, profile? }
      // Include all fields that are available in UI for update
      const updatePayload: Record<string, any> = {
        name: formData.name.trim(),
        email: formData.email.trim(), // Email is required and should be updated
      };
      
      // Include avatar if available (according to API spec)
      if (avatarUrl && avatarUrl.trim()) {
        updatePayload.avatar = avatarUrl.trim();
      }
      
      console.log('📤 Sending update payload:', updatePayload);
      console.log('📧 Original email:', originalEmail);
      console.log('📧 New email:', formData.email);
      console.log('📧 Email changed?', formData.email.toLowerCase() !== originalEmail.toLowerCase());

      try {
        // Based on Postman testing, backend uses PATCH method for profile updates
        // Start with PATCH as it's confirmed to work in Postman
        let endpoint = `${API_BASE_URL}/admin/users/${user.id}/profile`;
        let method = 'PATCH'; // Changed from PUT to PATCH (Postman shows PATCH works)
        
        console.log('🔄 Trying endpoint:', endpoint, 'Method:', method);
        console.log('📤 Full payload being sent:', JSON.stringify(updatePayload, null, 2));
        console.log('📧 Email in payload:', updatePayload.email);
        console.log('📧 Name in payload:', updatePayload.name);
        
        response = await fetch(endpoint, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        });
        
        console.log('📥 Response status:', response.status, response.statusText);
        
        // If 404, try PUT method as fallback
        if (response.status === 404) {
          console.log('⚠️ PATCH failed with 404, trying PUT method');
          method = 'PUT';
          response = await fetch(endpoint, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatePayload),
          });
          console.log('📥 PUT Response status:', response.status, response.statusText);
        }
        
        // If still 404, try without /profile
        if (response.status === 404) {
          console.log('⚠️ PATCH /profile failed, trying PATCH /admin/users/:id');
          endpoint = `${API_BASE_URL}/admin/users/${user.id}`;
          method = 'PATCH';
          response = await fetch(endpoint, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatePayload),
          });
          console.log('📥 PATCH /users/:id Response status:', response.status, response.statusText);
        }
        
        // If still 404, try PUT /admin/users/:id
        if (response.status === 404) {
          console.log('⚠️ PATCH /users/:id failed, trying PUT /admin/users/:id');
          method = 'PUT';
          response = await fetch(endpoint, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatePayload),
          });
          console.log('📥 PUT /users/:id Response status:', response.status, response.statusText);
        }

        // Parse response
        const responseText = await response.text();
        console.log('📥 Full response text:', responseText);
        
        try {
          data = JSON.parse(responseText);
          console.log('📥 Parsed response data:', data);
          console.log('📧 Email in response:', data.user?.email || data.email);
          console.log('📧 Name in response:', data.user?.name || data.name);
        } catch (parseError) {
          console.error('Failed to parse JSON response:', responseText);
          throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}. Response: ${responseText.substring(0, 100)}`);
        }

        if (!response.ok) {
          const errorMsg = data?.message || data?.error || data?.detail || `Failed to update profile: ${response.status} ${response.statusText}`;
          
          // Special handling for 404 - backend route doesn't exist
          if (response.status === 404) {
            console.error('❌ 404 ERROR: Backend endpoint not found!');
            console.error('   Tried endpoint:', endpoint);
            console.error('   Tried method:', method);
            console.error('   Backend may not have this route configured.');
            toast.error(`Backend endpoint not found (404). Please check if ${endpoint} with ${method} method exists in backend.`);
          } else {
            toast.error(errorMsg);
          }
          
          console.error('❌ Profile update failed:', { 
            status: response.status, 
            statusText: response.statusText,
            endpoint: endpoint,
            method: method,
            data 
          });
          return;
        }
      } catch (fetchError: any) {
        console.error('Error updating profile:', fetchError);
        toast.error(fetchError.message || 'Failed to update profile. Please check your connection.');
        return;
      }

        // Success - check what was actually updated
        console.log('✅ Profile update successful!');
        console.log('Response data:', data);
        console.log('Updated user from response:', data.user || data);
        
        const updatedUser = data.user || data;
        const emailChanged = formData.email.toLowerCase() !== originalEmail.toLowerCase();
        
        // Check if email was actually updated in response
        if (updatedUser?.email) {
          console.log('📧 Email in response:', updatedUser.email);
          console.log('📧 Expected email:', formData.email);
          const emailMatches = updatedUser.email.toLowerCase() === formData.email.toLowerCase();
          
          if (!emailMatches) {
            console.error('❌ EMAIL UPDATE FAILED!');
            console.error('   Sent email:', formData.email);
            console.error('   Received email:', updatedUser.email);
            console.error('   Backend may not be updating email field. Check backend API.');
            
            // Show error toast if email was supposed to change
            if (emailChanged) {
              toast.error(`Email update failed! Backend returned: ${updatedUser.email}. The backend may not allow email updates through this endpoint.`, {
                duration: 7000,
              });
            } else {
              toast.warning('Profile updated, but email may not have changed. Please check.');
            }
          } else {
            console.log('✅ Email updated successfully in backend!');
          }
        } else {
          console.warn('⚠️ No email in response! Response:', updatedUser);
          if (emailChanged) {
            toast.error('Email update failed! No email in response from backend.');
          }
        }
        
        if (emailChanged) {
          toast.success("Profile updated successfully! Please note: You will need to use the new email address for future logins.", {
            duration: 5000,
          });
        } else {
    toast.success("Profile updated successfully!");
        }
        
    setIsEditDialogOpen(false);
        
        // Refresh user data from backend (real-time update without page reload)
        if (refreshUser) {
          console.log('🔄 Refreshing user data from backend...');
          await refreshUser();
          console.log('✅ User data refreshed successfully!');
          
          // Update local state immediately for better UX
          // The useEffect will sync when user changes, but we can also update formData here
          if (updatedUser) {
            setFormData({
              name: updatedUser.name || formData.name,
              email: updatedUser.email || formData.email,
            });
            
            // Update avatar if present
            const newAvatar = (updatedUser as any)?.avatar || (updatedUser as any)?.profileImage || null;
            if (newAvatar) {
              setAvatarUrl(newAvatar);
            }
            
            // Update originalEmail
            if (updatedUser.email) {
              setOriginalEmail(updatedUser.email);
            }
          }
        } else {
          console.warn('⚠️ refreshUser function not available, falling back to page reload');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error: any) {
        console.error('❌ Error updating profile:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          cause: error.cause
        });
        // Don't reload on error, let user see the error
        toast.error(error.message || 'Failed to update profile. Please try again.');
        // Keep dialog open so user can see the error and try again
      }
  };

  const handleCancel = () => {
    setIsEditDialogOpen(false);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for image upload
      const formData = new FormData();
      // Try 'file' as field name since endpoint has ?file query parameter
      formData.append('file', file);

      // Get auth token if available
      const token = getToken();
      
      // Use avatar upload endpoint with file query parameter: /admin/upload/avatar?file
      const uploadUrl = `${API_BASE_URL}/admin/upload/avatar?file`;
      
      console.log('Uploading to:', uploadUrl);
      console.log('User ID:', user.id);
      console.log('File:', file.name, file.type, file.size);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          // Don't set Content-Type, browser will set it automatically with boundary
          // Add auth token if available
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });
      
      console.log('Response status:', response.status, response.statusText);

      // Check if response is ok
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Upload failed';
        let errorData = null;
        try {
          const responseText = await response.text();
          console.error('Error response text:', responseText);
          if (responseText) {
            try {
              errorData = JSON.parse(responseText);
              errorMessage = errorData.error || errorData.message || errorData.msg || errorData.details || `Server error: ${response.status}`;
            } catch {
              errorMessage = responseText || `Server error: ${response.status} ${response.statusText}`;
            }
          }
          console.error('Upload error response:', errorData || responseText);
        } catch (parseError) {
          // If parsing fails, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      // Extract Cloudinary URL from response
      // API might return: { url, avatar, imageUrl, secure_url, data: { url } }
      const imageUrl = data.url || data.avatar || data.imageUrl || data.secure_url || data.data?.url || data.data?.avatar;
      
      if (imageUrl) {
        // Update local state
        setAvatarUrl(imageUrl);
        toast.success('Profile picture uploaded successfully!');
      } else {
        console.error('Upload response (no URL found):', data);
        toast.error('Image uploaded but URL not received from server. Response: ' + JSON.stringify(data));
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMsg = error.message || 'Failed to upload image. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-1">Profile</h1>
        <p className="text-slate-600">View and manage your admin profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
              <Avatar className="h-24 w-24">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={user.name} />
                  ) : null}
                <AvatarFallback className="bg-slate-900 text-white text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
                <button
                  onClick={handleImageClick}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center border-2 border-white shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Change profile picture"
                >
                  {isUploading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                <Badge
                  variant="outline"
                  className={`mt-2 ${
                    isSuperAdmin
                      ? "border-purple-500 text-purple-700 bg-purple-50"
                      : "border-blue-500 text-blue-700 bg-blue-50"
                  }`}
                >
                  {isSuperAdmin ? "Super Admin" : "Admin"}
                </Badge>
              </div>
            </div>
            <Separator />
            <Button variant="outline" className="w-full" onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Detailed information about your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Full Name</p>
                  <p className="text-base text-slate-900 mt-1">{user.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Mail className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Email Address</p>
                  <p className="text-base text-slate-900 mt-1">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Shield className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Role</p>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={
                        isSuperAdmin
                          ? "border-purple-500 text-purple-700 bg-purple-50"
                          : "border-blue-500 text-blue-700 bg-blue-50"
                      }
                    >
                      {isSuperAdmin ? "Super Admin" : "Regular Admin"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">User ID</p>
                  <p className="text-base text-slate-900 mt-1 font-mono text-sm">{user.id}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Permissions Summary */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Key Permissions</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(permissions)
                  .filter(([_, value]) => value === true)
                  .slice(0, 8)
                  .map(([key]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-md"
                    >
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  ))}
              </div>
              {Object.values(permissions).filter((p) => p === true).length > 8 && (
                <p className="text-xs text-slate-500 mt-2">
                  +{Object.values(permissions).filter((p) => p === true).length - 8} more
                  permissions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Access</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="justify-start">
              Login History
            </Button>
            <Button variant="outline" className="justify-start">
              Active Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information. Changes will be saved to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Avatar Upload Section */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={formData.name || "User"} />
                    ) : null}
                    <AvatarFallback className="bg-slate-900 text-white text-lg">
                      {getInitials(formData.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImageClick}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {isUploading ? "Uploading..." : "Change Avatar"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    JPG, PNG or GIF. Max size 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email address"
              />
              <p className="text-xs text-slate-500 mt-1">
                Note: Changing your email will require you to use the new email for future logins.
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-600">
                <strong>Note:</strong> Changing your email address may require verification. Your
                role cannot be changed from this panel.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

