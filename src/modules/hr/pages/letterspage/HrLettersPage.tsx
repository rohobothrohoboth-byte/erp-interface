import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileSignature, Printer, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Field, inputCls } from '@/modules/inventory/components/FormModal';
import { getAllEmployees } from '@/modules/hr/services/employee/emp.api';
import type { EmployeeListDto } from '@/modules/hr/types/employee';
import { empDetailApi } from '@/modules/hr/services/employee/empDetail/empDetail.api';
import type { EmpDetailImage } from '@/modules/hr/services/employee/empDetail/empDetail.api';
import { useCompanyLetterhead, printLetter } from '@/modules/hr/pages/reportspage/reportKit';
import { useAuthStore } from '@/shared/stores/auth.store';

const toDataUrl = (img?: EmpDetailImage | null): string | undefined =>
  img?.image ? `data:${img.contentType || 'image/png'};base64,${img.image}` : undefined;

type LetterType = 'experience' | 'clearance' | 'employment' | 'recommendation' | 'guarantee' | 'warning';

const LETTER_TYPES: { value: LetterType; label: string; title: string }[] = [
  { value: 'experience', label: 'Experience Letter', title: 'Work Experience Certificate' },
  { value: 'clearance', label: 'Clearance Letter', title: 'Employee Clearance Certificate' },
  { value: 'employment', label: 'Employment Confirmation', title: 'Employment Confirmation Letter' },
  { value: 'recommendation', label: 'Support / Recommendation Letter', title: 'Letter of Recommendation' },
  { value: 'guarantee', label: 'Salary / Guarantee Letter', title: 'Salary & Employment Guarantee Letter' },
  { value: 'warning', label: 'Warning Letter', title: 'Warning Letter' },
];

function buildBody(type: LetterType, emp: EmployeeListDto | undefined, company: string): string {
  const name = emp?.empFullName || '[EMPLOYEE NAME]';
  const code = emp?.code || '[CODE]';
  const position = emp?.position || '[POSITION]';
  const dept = emp?.department || '[DEPARTMENT]';
  const heShe = 'they';
  const posDept = `${position} in the ${dept} department`;

  switch (type) {
    case 'experience':
      return `This is to certify that ${name} (Employee ID: ${code}) was employed at ${company} as ${posDept} from [START DATE] to [END DATE].

Throughout ${heShe} tenure, ${name} carried out the assigned responsibilities with dedication, competence, and professionalism, and maintained good conduct and working relationships with colleagues.

This certificate is issued upon ${heShe} request for whatever purpose it may serve.`;
    case 'clearance':
      return `This is to certify that ${name} (Employee ID: ${code}), who served as ${posDept}, has settled all financial obligations and returned all company property, documents, and assets entrusted to ${heShe} as of [CLEARANCE DATE].

Accordingly, ${name} is hereby cleared of all responsibilities toward ${company} and no outstanding liabilities remain against ${heShe} name.

This clearance is issued upon ${heShe} request.`;
    case 'employment':
      return `This letter confirms that ${name} (Employee ID: ${code}) is currently employed at ${company} as ${posDept}, effective from [EMPLOYMENT DATE].

${name} is a valued member of our organization in good standing. This letter is issued upon ${heShe} request and may be used for official purposes as required.`;
    case 'recommendation':
      return `It is my pleasure to recommend ${name}, who served as ${posDept} at ${company}.

During this time, ${name} demonstrated strong professional skills, reliability, and commitment, and made valuable contributions to the team. ${name} would be an asset to any organization.

I am pleased to provide this recommendation and am available for any further information required.`;
    case 'guarantee':
      return `This is to confirm that ${name} (Employee ID: ${code}) is a permanent employee of ${company}, holding the position of ${position} in the ${dept} department, with a current gross monthly salary of [GROSS SALARY].

This letter is issued upon ${heShe} request for the purpose of [PURPOSE] and serves as confirmation of ${heShe} employment and income status with our organization.`;
    case 'warning':
      return `This letter serves as a formal warning to ${name} (Employee ID: ${code}), ${posDept}, regarding [SUBJECT OF WARNING] that occurred on [DATE OF INCIDENT].

This conduct is not in line with the standards and policies of ${company}. You are hereby advised to take immediate corrective action. Failure to improve may result in further disciplinary measures up to and including termination.

Please treat this matter with the seriousness it deserves.`;
    default:
      return '';
  }
}

export default function HrLettersPage() {
  const { letterhead } = useCompanyLetterhead();
  const { data: employees = [] } = useQuery<EmployeeListDto[]>({
    queryKey: ['employees', 'forLetters'],
    queryFn: getAllEmployees,
    staleTime: 5 * 60 * 1000,
  });

  const [empSearch, setEmpSearch] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [type, setType] = useState<LetterType>('experience');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [refNo, setRefNo] = useState('');
  const [recipient, setRecipient] = useState('To Whom It May Concern,');
  const [body, setBody] = useState('');
  const [closing, setClosing] = useState('Sincerely,');
  const [signatoryName, setSignatoryName] = useState('');
  const [signatoryTitle, setSignatoryTitle] = useState('Human Resources Manager');
  const [includeEmpSignature, setIncludeEmpSignature] = useState(true);

  // Selected employee's signature & personal stamp (best-effort; may be absent).
  const { data: empSign } = useQuery({
    queryKey: ['emp-sign-letter', employeeId],
    queryFn: () => empDetailApi.getSign(employeeId),
    enabled: !!employeeId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const { data: empStamp } = useQuery({
    queryKey: ['emp-stamp-letter', employeeId],
    queryFn: () => empDetailApi.getStamp(employeeId),
    enabled: !!employeeId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const emp = useMemo(() => employees.find((e) => String(e.id) === employeeId), [employees, employeeId]);
  const filteredEmps = useMemo(() => {
    const q = empSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => [e.empFullName, e.code, e.department].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [employees, empSearch]);

  const currentTitle = LETTER_TYPES.find((t) => t.value === type)?.title || 'Letter';

  // Regenerate the body template when the employee or letter type changes.
  useEffect(() => {
    setBody(buildBody(type, emp, letterhead.name));
  }, [type, employeeId, emp, letterhead.name]);

  const printedBy = useAuthStore((s) => s.userName) || undefined;

  const onPrint = () => {
    printLetter(letterhead, {
      title: currentTitle,
      refNo: refNo || undefined,
      date: new Date(date).toLocaleDateString(),
      recipient,
      body,
      closing,
      signatoryName,
      signatoryTitle,
      signatureImage: includeEmpSignature ? toDataUrl(empSign) : undefined,
      personalStampImage: includeEmpSignature ? toDataUrl(empStamp) : undefined,
    }, printedBy);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <FileSignature className="h-6 w-6 text-teal-600" /> HR Letters
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Prepare clearance, experience, employment, recommendation, guarantee, and warning letters on company letterhead.
          </p>
        </div>
        <Button onClick={onPrint} className="bg-teal-600 hover:bg-teal-700">
          <Printer className="mr-1.5 h-4 w-4" /> Print / PDF
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        {/* Left: form */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <Field label="Letter type">
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as LetterType)}>
              {LETTER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Employee">
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={`${inputCls} pl-9`} placeholder="Search employee..." value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} />
            </div>
            <select className={inputCls} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">Select employee…</option>
              {filteredEmps.map((e) => (
                <option key={String(e.id)} value={String(e.id)}>
                  {e.empFullName} {e.code ? `(${e.code})` : ''}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Ref No."><input className={inputCls} value={refNo} onChange={(e) => setRefNo(e.target.value)} placeholder="HR/2026/001" /></Field>
          </div>

          <Field label="Recipient"><input className={inputCls} value={recipient} onChange={(e) => setRecipient(e.target.value)} /></Field>
          <Field label="Closing"><input className={inputCls} value={closing} onChange={(e) => setClosing(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Signatory name"><input className={inputCls} value={signatoryName} onChange={(e) => setSignatoryName(e.target.value)} placeholder="e.g. Selam Bekele" /></Field>
            <Field label="Signatory title"><input className={inputCls} value={signatoryTitle} onChange={(e) => setSignatoryTitle(e.target.value)} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={includeEmpSignature}
              onChange={(e) => setIncludeEmpSignature(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600"
            />
            Include the selected employee's signature &amp; personal stamp
            {employeeId && (
              <span className="text-xs text-slate-400">
                ({empSign?.image ? 'signature ✓' : 'no signature'}, {empStamp?.image ? 'stamp ✓' : 'no stamp'})
              </span>
            )}
          </label>
          <Button variant="outline" size="sm" className="w-full" onClick={() => setBody(buildBody(type, emp, letterhead.name))}>
            Reset body to template
          </Button>
        </div>

        {/* Right: letter preview + editable body */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4 border-b-2 border-teal-600 pb-3">
            {letterhead.logoUrl ? (
              <img src={letterhead.logoUrl} alt="logo" className="h-14 w-auto max-w-[150px] object-contain" />
            ) : null}
            <div>
              <div className="text-lg font-bold text-slate-900">{letterhead.name}</div>
              {letterhead.address && <div className="text-xs text-slate-500">{letterhead.address}</div>}
              {(letterhead.phone || letterhead.email || letterhead.website) && (
                <div className="text-xs text-teal-700">
                  {[letterhead.phone && `Tel: ${letterhead.phone}`, letterhead.email, letterhead.website].filter(Boolean).join('  |  ')}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-between text-xs text-slate-500">
            <span>{refNo ? `Ref: ${refNo}` : ''}</span>
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
          <div className="mt-3 text-sm text-slate-700">{recipient}</div>
          <div className="mt-3 text-sm font-bold uppercase tracking-wide text-slate-900 underline">{currentTitle}</div>

          <textarea
            className="mt-3 min-h-[280px] w-full resize-y rounded-lg border border-slate-200 p-3 text-sm leading-relaxed text-slate-800 focus:border-teal-500 focus:outline-none"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Select an employee and letter type to generate the letter body, then edit as needed."
          />

          <div className="mt-4 text-sm text-slate-700">
            <div>{closing}</div>
            <div className="mt-8 font-semibold">{signatoryName || '________________'}</div>
            <div className="text-slate-500">{signatoryTitle}</div>
          </div>
          {letterhead.motto && <div className="mt-6 border-t border-slate-100 pt-2 text-center text-xs italic text-teal-700">“{letterhead.motto}”</div>}
        </div>
      </div>
    </motion.div>
  );
}
