import { getEditableData } from '../utils/editableData';

const defaultProjects = [
  {
    id: 'network-scanner',
    title: 'Network Scanner Tool',
    description: 'A Python-based network scanning tool for discovering hosts, open ports, and services on a network. Features include port scanning, service detection, and vulnerability assessment.',
    categories: ['Pentesting', 'Network'],
    technologies: ['Python', 'Scapy', 'Nmap', 'Linux'],
    github: 'https://github.com/example'
  },
  {
    id: 'password-analyzer',
    title: 'Password Security Analyzer',
    description: 'A security tool that analyzes password strength, checks for common vulnerabilities, and tests against known password dictionaries. Helps identify weak passwords in systems.',
    categories: ['Security', 'Pentesting'],
    technologies: ['Python', 'Hashcat', 'Cryptography', 'CLI'],
    github: 'https://github.com/Chief-Ethical-Programmer/Detectify'
  },
  {
    id: 'web-vulnerability-scanner',
    title: 'Web Vulnerability Scanner',
    description: 'An automated web application security scanner that detects common vulnerabilities like SQL injection, XSS, CSRF, and other OWASP Top 10 issues.',
    categories: ['Web Security', 'Pentesting'],
    technologies: ['Python', 'Requests', 'BeautifulSoup', 'OWASP'],
    github: 'https://github.com/example'
  },
  {
    id: 'packet-analyzer',
    title: 'Network Packet Analyzer',
    description: 'A custom network packet analyzer built with Python and Scapy for capturing, analyzing, and inspecting network traffic in real-time.',
    categories: ['Network', 'Forensics'],
    technologies: ['Python', 'Scapy', 'Wireshark', 'Network Analysis'],
    github: 'https://github.com/example'
  },
  {
    id: 'malware-detection',
    title: 'Malware Detection System',
    description: 'A machine learning-based malware detection system that analyzes file signatures and behavioral patterns to identify potentially malicious software.',
    categories: ['Malware Analysis', 'Machine Learning'],
    technologies: ['Python', 'Machine Learning', 'YARA', 'Forensics'],
    github: 'https://github.com/example'
  },
  {
    id: 'ctf-platform',
    title: 'CTF Challenge Platform',
    description: 'A Capture The Flag platform for hosting security challenges, including crypto, web, forensics, and reverse engineering challenges.',
    categories: ['CTF', 'Web Development'],
    technologies: ['Docker', 'Python', 'Flask', 'Linux'],
    github: 'https://github.com/example'
  }
];

export const projects = getEditableData('projects', defaultProjects);


