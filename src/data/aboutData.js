import { getEditableData } from '../utils/editableData';

const defaultSkills = [
  {
    id: 'penetration-testing',
    name: 'Penetration Testing',
    icon: '🔓',
    description: 'Ethical hacking and vulnerability assessment',
  },
  {
    id: 'network-security',
    name: 'Network Security',
    icon: '🌐',
    description: 'Firewall configuration, IDS/IPS, network analysis'
  },
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    description: 'Security scripting, automation, and tool development'
  },
  {
    id: 'linux-unix',
    name: 'Linux/Unix',
    icon: '🐧',
    description: 'System administration and security hardening'
  },
  {
    id: 'wireshark',
    name: 'Wireshark',
    icon: '📡',
    description: 'Network traffic analysis and packet inspection'
  },
  {
    id: 'metasploit',
    name: 'Metasploit',
    icon: '⚔️',
    description: 'Penetration testing framework and exploitation'
  },
  {
    id: 'web-security',
    name: 'Web Security',
    icon: '🛡️',
    description: 'OWASP Top 10, SQL injection, XSS prevention'
  }
];

export const skills = getEditableData('skills', defaultSkills);

const defaultExperience = [
  {
    title: 'Cybersecurity Intern',
    company: 'Security Firm',
    date: '2023 - Present',
    description: 'Assisting in security assessments, vulnerability scanning, and penetration testing.',
    responsibilities: [
      'Conducted vulnerability assessments and penetration tests',
      'Analyzed security logs and identified potential threats',
      'Assisted in developing security policies and procedures',
      'Participated in incident response and security monitoring'
    ]
  },
  {
    title: 'Security Researcher',
    company: 'Bug Bounty Programs',
    date: '2022 - Present',
    description: 'Identifying and reporting security vulnerabilities in web applications.',
    responsibilities: [
      'Discovered and reported multiple critical vulnerabilities',
      'Collaborated with security teams to remediate issues',
      'Researched new attack vectors and security techniques',
      'Contributed to security awareness and training programs'
    ]
  }
];

export const experience = getEditableData('experience', defaultExperience);

const defaultEducation = [
  {
    degree: 'Bachelor of Science in Cybersecurity',
    institution: 'University Name',
    date: '2020 - Present',
    description: 'Focus on network security, cryptography, ethical hacking, and digital forensics.'
  },
  {
    degree: 'Cybersecurity Certification Program',
    institution: 'Security Training Institute',
    date: '2023',
    description: 'Comprehensive training in penetration testing, incident response, and security analysis.'
  }
];

export const education = getEditableData('education', defaultEducation);


