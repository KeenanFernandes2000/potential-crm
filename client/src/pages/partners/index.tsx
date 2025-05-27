import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Partner } from "@/../../shared/schema";
import PartnerForm from "./PartnerForm";

export default function PartnersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: partners = [], isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (partner.contactPerson && partner.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (partner.industry && partner.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedPartner(null);
    toast({
      title: "Success",
      description: selectedPartner ? "Partner updated successfully" : "Partner created successfully",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    
    try {
      const response = await fetch(`/api/partners/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Partner deleted successfully",
        });
        // Refresh the data
        window.location.reload();
      } else {
        throw new Error("Failed to delete partner");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading partners...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Partners</h1>
          <p className="text-muted-foreground">Manage your business partners</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedPartner(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPartner ? "Edit Partner" : "Add New Partner"}
              </DialogTitle>
            </DialogHeader>
            <PartnerForm
              partner={selectedPartner}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search partners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{partner.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {partner.email}
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(partner)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(partner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {partner.phone && (
                <div className="text-sm">
                  <span className="font-medium">Phone:</span> {partner.phone}
                </div>
              )}
              
              {partner.company && (
                <div className="flex items-center text-sm">
                  <Building2 className="h-3 w-3 mr-1" />
                  <span className="font-medium">Company:</span>
                  <span className="ml-1">{partner.company}</span>
                </div>
              )}

              {partner.type && (
                <Badge variant="secondary">{partner.type}</Badge>
              )}

              {partner.status && (
                <Badge 
                  variant={partner.status === 'Active' ? 'default' : 'secondary'}
                >
                  {partner.status}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-lg font-semibold">No partners found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first partner"}
          </p>
        </div>
      )}
    </div>
  );
}