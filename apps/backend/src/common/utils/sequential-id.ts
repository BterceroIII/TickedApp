type SequentialRecord = { id: string } | null;

export async function generateSequentialId({
  prefix,
  findLast,
}: {
  prefix: string;
  findLast: () => Promise<SequentialRecord>;
}): Promise<string> {
  const lastRecord = await findLast();
  let nextNumber = 1;

  if (lastRecord) {
    const match = lastRecord.id.match(new RegExp(`^${prefix}-(\\d+)$`));

    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
}
