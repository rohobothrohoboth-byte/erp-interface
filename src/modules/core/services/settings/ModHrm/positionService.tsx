import { api } from "@/shared/services/api";
import type {
  UUID,
  PositionListDto,
  PositionAddDto,
  PositionModDto,
  PositionExpListDto,
  PositionExpAddDto,
  PositionExpModDto,
  PositionBenefitListDto,
  PositionBenefitAddDto,
  PositionBenefitModDto,
  PositionEduListDto,
  PositionEduAddDto,
  PositionEduModDto,
  PositionReqListDto,
  PositionReqAddDto,
  PositionReqModDto,
} from "@/modules/hr/types/position";

class PositionService {
  private baseUrl = `${import.meta.env.VITE_CORE_HRMM_URL || "core/hrmm/v1"}/Position`;
  private benefitUrl = `${import.meta.env.VITE_CORE_HRMM_URL || "core/hrmm/v1"}/PositionBenefit`;
  private eduUrl = `${import.meta.env.VITE_CORE_HRMM_URL || "core/hrmm/v1"}/PositionEdu`;
  private expUrl = `${import.meta.env.VITE_CORE_HRMM_URL || "core/hrmm/v1"}/PositionExp`;
  private reqUrl = `${import.meta.env.VITE_CORE_HRMM_URL || "core/hrmm/v1"}/PositionReq`;

  // Helper method to extract error messages
  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      // Handle validation errors (object with field names as keys)
      const errors = error.response.data.errors;
      const errorMessages = Object.values(errors).flat();
      return errorMessages.join(', ');
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  // ============ POSITION CRUD OPERATIONS ============

  // GET: /api/core/hrmm/v1/Position/AllPosition
  async getAllPositions(): Promise<PositionListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllPosition`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error fetching positions:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // GET: /api/core/hrmm/v1/Position/GetPosition/{id}
  async getPositionById(id: UUID): Promise<PositionListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetPosition/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error fetching position:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /api/core/hrmm/v1/Position/AddPosition
  async createPosition(position: PositionAddDto): Promise<PositionListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddPosition`, position);
      console.info('Position created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error creating position:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // PUT: /api/core/hrmm/v1/Position/ModPosition/{id}
  async updatePosition(updateData: PositionModDto): Promise<PositionListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModPosition/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error updating position:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // DELETE: /api/core/hrmm/v1/Position/DelPosition/{id}
  async deletePosition(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelPosition/${id}`);
      console.info('Position deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error deleting position:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // ============ POSITION BENEFIT OPERATIONS ============

  // GET: /api/core/hrmm/v1/PositionBenefit/AllPositionBenefit/{id}
  async getAllPositionBenefits(id: UUID): Promise<PositionBenefitListDto[]> {
    try {
      const response = await api.get(`${this.benefitUrl}/AllPositionBenefit/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error fetching position benefits:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /api/core/hrmm/v1/PositionBenefit/AddPositionBenefit
  async createPositionBenefit(
    benefit: PositionBenefitAddDto
  ): Promise<PositionBenefitListDto> {
    try {
      const response = await api.post(`${this.benefitUrl}/AddPositionBenefit`, benefit);
      console.info('Position benefit created successfully:', response.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error creating position benefit:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // PUT: /api/core/hrmm/v1/PositionBenefit/ModPositionBenefit/{id}
  async updatePositionBenefit(
    updateData: PositionBenefitModDto
  ): Promise<PositionBenefitListDto> {
    try {
      const response = await api.put(`${this.benefitUrl}/ModPositionBenefit/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error updating position benefit:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // DELETE: /api/core/hrmm/v1/PositionBenefit/DelPositionBenefit/{id}
  async deletePositionBenefit(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.benefitUrl}/DelPositionBenefit/${id}`);
      console.info('Position benefit deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error deleting position benefit:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // ============ POSITION EDUCATION OPERATIONS ============

  // GET: /api/core/hrmm/v1/PositionEdu/AllPositionEdu/{id}
  async getAllPositionEducations(id: UUID): Promise<PositionEduListDto[]> {
    try {
      const response = await api.get(`${this.eduUrl}/AllPositionEdu/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error fetching position educations:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /api/core/hrmm/v1/PositionEdu/AddPositionEdu
  async createPositionEducation(
    education: PositionEduAddDto
  ): Promise<PositionEduListDto> {
    try {
      const response = await api.post(`${this.eduUrl}/AddPositionEdu`, education);
      console.info('Position education created successfully:', response.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error creating position education:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // PUT: /api/core/hrmm/v1/PositionEdu/ModPositionEdu/{id}
  async updatePositionEducation(
    updateData: PositionEduModDto
  ): Promise<PositionEduListDto> {
    try {
      const response = await api.put(`${this.eduUrl}/ModPositionEdu/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error updating position education:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // DELETE: /api/core/hrmm/v1/PositionEdu/DelPositionEdu/{id}
  async deletePositionEducation(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.eduUrl}/DelPositionEdu/${id}`);
      console.info('Position education deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error deleting position education:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // ============ POSITION EXPERIENCE OPERATIONS ============

  // GET: /api/core/hrmm/v1/PositionExp/AllPositionExp/{id}
  async getAllPositionExperiences(id: UUID): Promise<PositionExpListDto[]> {
    try {
      const response = await api.get(`${this.expUrl}/AllPositionExp/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error fetching position experiences:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /api/core/hrmm/v1/PositionExp/AddPositionExp
  async createPositionExperience(
    experience: PositionExpAddDto
  ): Promise<PositionExpListDto> {
    try {
      const response = await api.post(`${this.expUrl}/AddPositionExp`, experience);
      console.info('Position experience created successfully:', response.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error creating position experience:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // PUT: /api/core/hrmm/v1/PositionExp/ModPositionExp/{id}
  async updatePositionExperience(
    updateData: PositionExpModDto
  ): Promise<PositionExpListDto> {
    try {
      const response = await api.put(`${this.expUrl}/ModPositionExp/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error updating position experience:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // DELETE: /api/core/hrmm/v1/PositionExp/DelPositionExp/{id}
  async deletePositionExperience(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.expUrl}/DelPositionExp/${id}`);
      console.info('Position experience deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error deleting position experience:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // ============ POSITION REQUIREMENT OPERATIONS ============

  // GET: /api/core/hrmm/v1/PositionReq/AllPositionReq/{id}
  async getAllPositionRequirements(id: UUID): Promise<PositionReqListDto[]> {
    try {
      const response = await api.get(`${this.reqUrl}/AllPositionReq/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error fetching position requirements:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /api/core/hrmm/v1/PositionReq/AddPositionReq
  async createPositionRequirement(
    requirement: PositionReqAddDto
  ): Promise<PositionReqListDto> {
    try {
      const response = await api.post(`${this.reqUrl}/AddPositionReq`, requirement);
      console.info('Position requirement created successfully:', response.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error creating position requirement:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // PUT: /api/core/hrmm/v1/PositionReq/ModPositionReq/{id}
  async updatePositionRequirement(
    updateData: PositionReqModDto
  ): Promise<PositionReqListDto> {
    try {
      const response = await api.put(`${this.reqUrl}/ModPositionReq/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error updating position requirement:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  // DELETE: /api/core/hrmm/v1/PositionReq/DelPositionReq/{id}
  async deletePositionRequirement(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.reqUrl}/DelPositionReq/${id}`);
      console.info('Position requirement deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error("Error deleting position requirement:", errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const positionService = new PositionService();