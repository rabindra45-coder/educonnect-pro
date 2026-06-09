## Goal
Pivot the Document & Exam modules from secondary school (SEE / classes 1–10) to a Class 11–12 (+2) college, with mobile-first marks entry that auto-loads each student's subject list.

## 1. Database changes (single migration)

Add stream/class metadata to subjects so marks entry can filter correctly.

- `subjects`: add `class text` (one of '11','12','both') default 'both', `stream text` (one of 'science','management','law','common') default 'common', `is_practical boolean` default false, `theory_full_marks int` default 75, `practical_full_marks int` default 25.
- Keep existing `full_marks` as fallback.
- No data migration needed — admin will map via Subjects UI (existing rows default to 'both' / 'common').
- Restrict `students.class` and `exams.class` to '11' or '12' at UI level only (no DB constraint, to preserve historical rows).

## 2. Document Management rebuild

Files removed:
- `src/components/admin/documents/SEECertificateTemplate.tsx`
- `src/components/admin/documents/GradeSheetTemplate.tsx` (replaced)
- Old `CharacterCertificateTemplate.tsx` (rewritten for +2 wording)

New templates under `src/components/admin/documents/plus-two/`:

1. `Class12MarkSheetTemplate.tsx` — NEB-style +2 grade sheet
   - College header (navy/gold), student block (name, reg no, symbol no, DOB, stream, class)
   - Subject table: code, name, credit hr, theory (75), practical (25), total, grade, GP
   - Footer: GPA, overall grade, principal + controller signatures, college seal placeholder
   - Works for both class 11 (internal) and class 12 (NEB-style) via a `variant` prop
2. `PassingCertificateTemplate.tsx` — formal "this is to certify that … has successfully completed +2 in [Stream] with [GPA]" cert, gold borders, two signatures.
3. `MigrationCertificateTemplate.tsx` — issued to leaving students moving boards; includes "no objection" clause + last attended date.
4. `TransferCertificateTemplate.tsx` — SLC equivalent for +2: full ID block, conduct, date of leaving, reason.
5. `CharacterCertificateTemplate.tsx` — rewritten for +2 wording (no SEE/class 10 references).

Shared:
- `plus-two/CollegeLetterhead.tsx` — reusable navy/gold header with logo + estd year + address pulled from `school_settings`.
- `plus-two/SignatureBlock.tsx` — Principal / Controller of Examinations / Class Teacher.

`DocumentTemplateDialog.tsx`:
- Replace template options with: Class 11 Mark Sheet, Class 12 Mark Sheet, Passing Certificate, Migration Certificate, Transfer Certificate, Character Certificate.
- Form fields adapt per template (symbol no, NEB reg no, stream, GPA auto-prefill from latest exam result, date of issue in BS+AD).
- Mobile-first: stacked inputs, large tap targets, bottom-sheet preview on phones (uses `Sheet` instead of full Dialog under 640px).
- Auto-pull GPA / grades from `exam_marks` when generating mark sheet.

`DocumentsManagement.tsx`: update template picker labels, drop SEE/Grade-sheet references, add stream filter.

## 3. Exam Management & Marks Entry rebuild

`SubjectsManagement.tsx`:
- Add Class (11/12/Both) and Stream (Science/Management/Law/Common) fields, plus theory/practical splits and `is_practical` toggle.
- Subject list filterable by class+stream.

`MarksEntry.tsx` (full rewrite — per-student flow):
1. Select Exam (dropdown filtered to published-or-draft exams for class 11/12).
2. Student picker: searchable combobox listing students whose `class` + `stream` matches the exam (shows photo, name, roll, reg no).
3. Once selected, app queries `subjects` where `(class = student.class OR class = 'both') AND (stream = student.stream OR stream = 'common') AND is_active`.
4. Renders one card per subject (mobile-stacked, desktop 2-col):
   - Theory marks (out of theory_full_marks) + Practical marks (only if `is_practical`)
   - Auto-computed Total, Grade, GP via `calculate_neb_grade` (client mirror + DB confirm on save).
   - Remarks textarea.
   - Inputs use `inputmode="decimal"`, large 48px height, sticky save bar at bottom on mobile.
5. "Save all" upserts into `exam_marks` (unique on exam+student+subject); recalculates GPA via existing `calculate_gpa` RPC and writes summary into `student_results`.
6. Progress chip: "5 of 6 subjects entered".
7. Bulk-publish toggle on the exam (existing `is_published`).

`ExamsManagement.tsx`:
- Restrict class dropdown to 11/12, add Stream selector on exam creation so the marks-entry student list narrows correctly.

## 4. Propagation to other portals

- `StudentResultsCard.tsx` (student dashboard) + `AcademicProgress.tsx` (parent): already read from `exam_marks`/`student_results`. Update labels: "Grade 11/12 Result", show stream chip, NEB grade scale legend.
- `StudentDocumentsCard.tsx`: relabel `see_certificate` key → `passing_certificate`, add `migration_certificate`, `transfer_certificate`, `class12_marksheet`, `class11_marksheet`; keep `character_certificate`. Icons & badge colors updated.
- `parent/AcademicProgress.tsx`: same +2 terminology and stream display.
- `ExamResults.tsx` (admin) + public `academics/ExamResults.tsx`: filter to class 11/12 only, surface stream column.

## 5. Mobile UX polish

- All marks-entry inputs: 16px font (prevents iOS zoom), `inputmode="decimal"`.
- Sticky bottom "Save" bar with safe-area padding (`pb-[env(safe-area-inset-bottom)]`).
- Document preview uses `Sheet side="bottom"` under 640px, `Dialog` desktop.
- Use existing `ResponsiveDialog` pattern from `ResourceUploadDialog`.

## 6. Cleanup

- Delete `SEECertificateTemplate.tsx`, old `GradeSheetTemplate.tsx`.
- Remove SEE / class 1–10 strings from constants in `StudentDocumentsCard`, `DocumentTemplateDialog`, `DocumentsManagement`.
- Update `mem://features/academic-structure` note to reflect "+2 only, no SEE".

## Files to create
- `supabase/migrations/<ts>_plus_two_subject_metadata.sql`
- `src/components/admin/documents/plus-two/CollegeLetterhead.tsx`
- `src/components/admin/documents/plus-two/SignatureBlock.tsx`
- `src/components/admin/documents/plus-two/Class12MarkSheetTemplate.tsx`
- `src/components/admin/documents/plus-two/PassingCertificateTemplate.tsx`
- `src/components/admin/documents/plus-two/MigrationCertificateTemplate.tsx`
- `src/components/admin/documents/plus-two/TransferCertificateTemplate.tsx`
- `src/components/admin/documents/plus-two/CharacterCertificateTemplate.tsx`
- `src/components/admin/exams/StudentMarksForm.tsx` (extracted, reused)

## Files to edit
- `src/components/admin/documents/DocumentTemplateDialog.tsx`
- `src/pages/admin/DocumentsManagement.tsx`
- `src/pages/admin/MarksEntry.tsx`
- `src/pages/admin/ExamsManagement.tsx`
- `src/pages/admin/SubjectsManagement.tsx`
- `src/pages/admin/ExamResults.tsx`
- `src/pages/academics/ExamResults.tsx`
- `src/components/student/StudentResultsCard.tsx`
- `src/components/student/StudentDocumentsCard.tsx`
- `src/components/parent/AcademicProgress.tsx`

## Files to delete
- `src/components/admin/documents/SEECertificateTemplate.tsx`
- `src/components/admin/documents/GradeSheetTemplate.tsx`

## Risks / notes
- Existing `exam_marks` rows for classes < 11 stay readable but won't appear in the new admin filter (intentional — historic SEE data should be archived).
- `subjects` rows default to 'both'/'common' so nothing breaks for existing exams; admin should map streams afterwards.
- GPA recomputation reuses existing `calculate_gpa` SQL function — no new RPC required.
