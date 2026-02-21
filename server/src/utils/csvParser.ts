import { parse } from 'csv-parse';
import { Readable } from 'stream';

export interface ParsedContact {
  name: string;
  phone: string;
}

export async function parseCSV(buffer: Buffer): Promise<ParsedContact[]> {
  return new Promise((resolve, reject) => {
    const contacts: ParsedContact[] = [];

    const stream = Readable.from(buffer);

    stream.pipe(
      parse(
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        },
        (err, records: Record<string, string>[]) => {
          if (err) return reject(new Error(`CSV parse error: ${err.message}`));

          for (const record of records) {
            const name = record['name'] || record['Name'] || record['NAME'];
            const phone = record['phone'] || record['Phone'] || record['PHONE'] || record['phone_number'];

            if (!name || !phone) {
              return reject(
                new Error(
                  'CSV must contain "name" and "phone" columns. Found columns: ' +
                    Object.keys(record).join(', ')
                )
              );
            }

            const normalizedPhone = normalizePhone(phone.trim());
            if (!normalizedPhone) {
              return reject(new Error(`Invalid phone number: ${phone}`));
            }

            contacts.push({ name: name.trim(), phone: normalizedPhone });
          }

          resolve(contacts);
        }
      )
    );
  });
}

function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (!/^\+?[1-9]\d{6,14}$/.test(cleaned)) return null;
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}
