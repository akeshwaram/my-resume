/**
 * ResumeFormatter - Utility class for converting structured resume JSON data
 * into a human-readable text format suitable for AI analysis.
 */
class ResumeFormatter {
  /**
   * Validates that all required fields are present in the resume data
   * @param {Object} resumeData - The resume data object to validate
   * @throws {Error} If required fields are missing
   */
  static validateResumeData(resumeData) {
    if (!resumeData) {
      throw new Error('Resume data is required');
    }

    // Validate about section
    if (!resumeData.about || !resumeData.about.name || !resumeData.about.location || !resumeData.about.content) {
      throw new Error('Resume data must include about section with name, location, and content');
    }

    // Validate skills section
    if (!resumeData.skills || !Array.isArray(resumeData.skills.list)) {
      throw new Error('Resume data must include skills section with a list array');
    }

    // Validate experience section
    if (!resumeData.experience || !Array.isArray(resumeData.experience.list)) {
      throw new Error('Resume data must include experience section with a list array');
    }

    // Validate education section
    if (!resumeData.education || !Array.isArray(resumeData.education.list)) {
      throw new Error('Resume data must include education section with a list array');
    }

    // Validate certifications section
    if (!resumeData.certifications || !Array.isArray(resumeData.certifications.list)) {
      throw new Error('Resume data must include certifications section with a list array');
    }
  }

  /**
   * Formats the about section
   * @param {Object} about - The about section data
   * @returns {string} Formatted about section
   */
  static formatAboutSection(about) {
    return `Name: ${about.name}
Location: ${about.location}

About:
${about.content}`;
  }

  /**
   * Formats the skills section as bullet points
   * @param {Object} skills - The skills section data
   * @returns {string} Formatted skills section
   */
  static formatSkillsSection(skills) {
    const skillsList = skills.list.map(skill => `• ${skill}`).join('\n');
    return `Skills:
${skillsList}`;
  }

  /**
   * Formats the experience section with role, company, period, and highlights
   * @param {Object} experience - The experience section data
   * @returns {string} Formatted experience section
   */
  static formatExperienceSection(experience) {
    const experienceEntries = experience.list.map(entry => {
      const highlights = entry.highlights.map(highlight => `  • ${highlight}`).join('\n');
      return `${entry.role} at ${entry.company}
${entry.period} | ${entry.location}
${highlights}`;
    }).join('\n\n');

    return `Experience:
${experienceEntries}`;
  }

  /**
   * Formats the education section
   * @param {Object} education - The education section data
   * @returns {string} Formatted education section
   */
  static formatEducationSection(education) {
    const educationEntries = education.list.map(entry => 
      `• ${entry.degree} - ${entry.college}, ${entry.location}`
    ).join('\n');

    return `Education:
${educationEntries}`;
  }

  /**
   * Formats the certifications section
   * @param {Object} certifications - The certifications section data
   * @returns {string} Formatted certifications section
   */
  static formatCertificationsSection(certifications) {
    const certificationEntries = certifications.list.map(cert => {
      if (cert.date) {
        return `• ${cert.name} (${cert.date})`;
      }
      return `• ${cert.name}`;
    }).join('\n');

    return `Certifications:
${certificationEntries}`;
  }

  /**
   * Converts structured resume JSON data into a readable text format
   * @param {Object} resumeData - The complete resume data object
   * @returns {string} Formatted resume text suitable for AI analysis
   * @throws {Error} If required fields are missing
   */
  static formatResumeData(resumeData) {
    // Validate the resume data structure
    this.validateResumeData(resumeData);

    // Format each section
    const sections = [
      this.formatAboutSection(resumeData.about),
      '',
      this.formatSkillsSection(resumeData.skills),
      '',
      this.formatExperienceSection(resumeData.experience),
      '',
      this.formatEducationSection(resumeData.education),
      '',
      this.formatCertificationsSection(resumeData.certifications)
    ];

    // Join all sections with newlines
    return sections.join('\n');
  }
}

export default ResumeFormatter;
